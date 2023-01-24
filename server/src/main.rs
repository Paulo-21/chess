use axum::{
    extract::ws::{Message, WebSocketUpgrade, WebSocket},
    extract:: { Query,State},
    routing::get,
    response::{ /*Html,*/ Response},
    Router,
};
use futures::{ sink::SinkExt, stream::StreamExt, lock };
use std::{ net::SocketAddr };
use std::collections::BTreeMap;
use std::sync::Arc;
use tokio::sync:: { RwLock, broadcast };
//use serde::Deserialize;
use serde::{Deserialize, Serialize};
use serde_json::{ Result, Value };
use std::ops::Bound::Included;
//use serde::Serialize;
#[allow(dead_code)]
struct ChessGame {
    room_name: String,
    map : [[i32;8];8],
    tx: broadcast::Sender<String>,
}
#[derive(Deserialize, Clone)]
struct User {
    user_name : String,
}
#[derive(Clone)]
struct Player {
    name : String,
    elo : i16,
}
#[derive(Serialize, Deserialize)]
struct ChessMessage {
    room_name : String,
    sender : String,
    message : String,
}
struct Couille {
    c : Arc<RwLock<BTreeMap::<String, ChessGame>>>,
    b : Arc<RwLock<BTreeMap::<i16, Vec<Player>>>>,
}

#[tokio::main]
async fn main() {
    let room_vec = BTreeMap::<String, ChessGame>::new();
    let lock_room = RwLock::new(room_vec);
    let room = Arc::new(lock_room);
    let room2 = room.clone();
    let queue = BTreeMap::<i16, Vec<Player>>::new();
    let lock_queue = Arc::new(RwLock::new(queue));

    let couille = Couille {
        c  : room.clone(),
        b : lock_queue.clone(),
    };
    let cou = Arc::new(couille);
    let app = Router::new()
    .fallback(fallback)
    .route("/websocketChess/Game/:room_name/", get(handler_game)).with_state(room)
    .route("/websocketChess/Play/", get(handler_matchmaking)).with_state(cou)
    .route("/websocketChess/Friend/", get(handler_friend)).with_state(room2);

    let addr = SocketAddr::from(([127, 0, 0, 1], 8082));
    
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();

    async fn handler_game(axum::extract::Path(id):axum::extract::Path<String> , Query(user_name): Query<User>,  ws: WebSocketUpgrade , State(state): State<Arc<RwLock<BTreeMap::<String, ChessGame>>>> ) -> Response {
        ws.on_upgrade(|socket| handle_socket(socket, state, id, user_name))
    }
    async fn handler_matchmaking( Query(user_name): Query<User>,  ws: WebSocketUpgrade , State(state): State<Arc<Couille>> ) -> Response {
        let player = Player {
            name : user_name.user_name,
            elo : 1000,
        };
        ws.on_upgrade(|socket| handle_socket_matchmaking(socket, state, player))
    }
    async fn handler_friend( Query(user_name): Query<User>,  ws: WebSocketUpgrade , State(state): State<Arc<RwLock<BTreeMap::<String, ChessGame>>>> ) -> Response {
        ws.on_upgrade(|socket| handle_socket_friend(socket, state, user_name))
    }
    async fn handle_socket( socket: WebSocket, lock_room : Arc<RwLock<BTreeMap::<String, ChessGame>>>, room_name : String, user : User ) {
        println!("NEW ");
        let r1 = lock_room.read().await;
        let exist = (*r1).contains_key(&room_name.clone());
        drop(r1);
        if !exist {
            let mut  w1 = lock_room.write().await;
            let (tx, _rx) = broadcast::channel(100);
            let chess = ChessGame { room_name : room_name.clone(), map : [[0;8];8], tx};
            (*w1).insert(room_name.clone(), chess);
        }
        let r1 = lock_room.read().await;
        let chess  = (*r1).get(&room_name).unwrap();
        let mut rx = chess.tx.subscribe();
        let (mut sender , mut receiver) = socket.split();
        let user1 = user.clone();
        let mut send_task = tokio::spawn(async move {
            while let Ok(msg) = rx.recv().await {
                // In any websocket error, break loop.

                if sender.send(Message::Text(msg)).await.is_err() {
                    break;
                }
            }
        });
        let tx = chess.tx.clone();
        let mut recv_task = tokio::spawn(async move {
            while let Some(Ok(Message::Text(text))) = receiver.next().await {
                println!("Message : {}", text);
                let m = ChessMessage { room_name : room_name.clone(), sender : user1.user_name.clone(), message : String::from("Bonjour")};
                if let Ok(m) = serde_json::to_string(&m) {
                    let _ = tx.send(m);
                }
                //let _ = tx.send(format!("{}: {}", "Message : ", text));
            }
        });

        // If any one of the tasks run to completion, we abort the other.
        tokio::select! {
            _ = (&mut send_task) => recv_task.abort(),
            _ = (&mut recv_task) => send_task.abort(),
        };
    }

    async fn handle_socket_matchmaking( socket: WebSocket, couille : Arc<Couille>, user : Player ) {
        let user_elo = user.elo;
        let r1 = couille.b.read().await;
        if (*r1).contains_key(&user.elo) {

            drop(r1);
            let mut w1 = couille.b.write().await;
            let v = (*w1).get_mut(&user.elo).unwrap();
            v.push(user);
            drop(w1);
        }
        else {
            drop(r1);
            let mut w1 = couille.b.write().await;
            
            let v = Vec::from([user]);
            (*w1).insert(user_elo, v);
            drop(w1);
        }

        let mut w2 = couille.b.read().await;
        let mut selected:Vec<(i16, Player)> = Vec::new();
        let mut key_selected = 0;
        let mut delta = i16::MAX;
        for (&key, value) in (*w2).range((Included(&(user_elo-100)), Included(&(user_elo+100)))) {
            for x in value {
                selected.push((key.clone(), x.clone()));
            }
            let d:i16 = user_elo - key;
            let temp_delta = d.abs();
            if temp_delta < delta  {
                delta = temp_delta;
                key_selected = key;
            }
        }
    }
    async fn handle_socket_friend( socket: WebSocket, lock_room : Arc<RwLock<BTreeMap::<String, ChessGame>>>, user : User ) {
        
    }
    pub async fn fallback( uri: axum::http::Uri) -> impl axum::response::IntoResponse {
        println!("FALLBACK");
        (axum::http::StatusCode::NOT_FOUND, format!("No route {}", uri))
    }
}