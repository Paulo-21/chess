use axum::{
    extract::ws::{Message, WebSocketUpgrade, WebSocket},
    extract:: { Query,State},
    routing::get,
    response::{ /*Html,*/ Response},
    Router,
};
use futures::{ sink::SinkExt, stream::StreamExt };
//use rand::random;
use std::{ net::SocketAddr };
use std::collections::BTreeMap;
use std::sync::Arc;
use tokio::sync:: { RwLock, broadcast, oneshot::{self, Receiver, Sender} };
//use serde::Deserialize;
use serde::{Deserialize, Serialize};
use serde_json::{ Result, Value };
use std::ops::Bound::Included;
//use rand::Rng;
//use serde::Serialize;
mod chess;
use chess:: { Piece,Pion, Cavalier, Fou, Tour, Dame, Roi };
#[allow(dead_code)]
#[derive(Clone)]
struct ChessGame {
    room_name: String,
    map : [[i32;8];8],
    tx: broadcast::Sender<String>,
    white : Option<String>,
    black : Option<String>,
    white_to_play : bool,
    //pieces : [chess::Piece;32],
}
#[derive(Deserialize, Clone)]
struct User {
    user_name : String,
}
struct Player {
    name : String,
    elo : i16,
    //tx : Sender<String>,
}
#[derive(Serialize, Deserialize)]
struct ChessMessage {
    room_name : String,
    sender : String,
    message : String,
}
struct Couille {
    lock_room : Arc<RwLock<BTreeMap::<String, ChessGame>>>,
    lock_queue : Arc<RwLock<BTreeMap::<i16, Vec<Player>>>>,
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
        lock_room  : room.clone(),
        lock_queue : lock_queue.clone(),
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
        .await.unwrap();

    async fn handler_game(axum::extract::Path(room_name):axum::extract::Path<String> , Query(user_name): Query<User>,  ws: WebSocketUpgrade , State(state): State<Arc<RwLock<BTreeMap::<String, ChessGame>>>> ) -> Response {
        println!("NEW on GAME");
        ws.on_upgrade(|socket| handle_socket_game(socket, state, room_name, user_name))
    }
    async fn handler_matchmaking( Query(user_name): Query<User>,  ws: WebSocketUpgrade , State(state): State<Arc<Couille>> ) -> Response {
        //let (tx, rx) = oneshot::channel::<String>();

        let player = Player {
            name : user_name.user_name,
            elo : 1000,
            //tx : Arc::new(tx),
        };
        ws.on_upgrade(|socket| handle_socket_matchmaking(socket, state, player))
    }
    async fn handler_friend( Query(user_name): Query<User>,  ws: WebSocketUpgrade , State(state): State<Arc<RwLock<BTreeMap::<String, ChessGame>>>> ) -> Response {
        println!("New On friend");
        ws.on_upgrade(|socket| handle_socket_friend(socket, state, user_name))
    }
    async fn handle_socket_game( socket: WebSocket, lock_room : Arc<RwLock<BTreeMap::<String, ChessGame>>>, room_name : String, user : User ) {
        let r1 = lock_room.read().await;
        let exist = (*r1).contains_key(&room_name.clone());
        
        if !exist { //Finish connection if the room didn't exist
            drop(r1);
            return;
        }
        let chess_temp  =  (*r1).get(&room_name).unwrap();
        let chess = chess_temp.clone();
        drop(r1);
        let mut rx = chess.tx.subscribe();
        let (mut sender , mut receiver) = socket.split();
        let mut send_task = tokio::spawn(async move {
            while let Ok(msg) = rx.recv().await {
                // In any websocket error, break loop.
                if sender.send(Message::Text(msg)).await.is_err() {
                    break;
                }
            }
        });
        let user1 = user.clone();
        let tx = chess.tx.clone();
        let mut recv_task = tokio::spawn(async move {
            while let Some(Ok(Message::Text(text))) = receiver.next().await {
                println!("Message : {}", text);
                //let z = serde_json::from_str(&text);
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
        /*let user_elo = user.elo;
        let r1 = couille.lock_queue.read().await;
        if (*r1).contains_key(&user.elo) {

            drop(r1);
            let mut w1 = couille.lock_queue.write().await;
            let v = (*w1).get_mut(&user.elo).unwrap();
            v.push(user);
            drop(w1);
        }
        else {
            drop(r1);
            /*let mut w1 = couille.lock_queue.write().await;
            let v = Vec::from([user]);
            (*w1).insert(user_elo, v);
            drop(w1);*/
        }

        let mut w2 = couille.lock_queue.write().await;
        //let mut selected:Vec<i16> = Vec::new();
        let mut key_selected = 0;
        let mut delta = i16::MAX;
        for (&key, value) in (*w2).range((Included(&(user_elo-100)), Included(&(user_elo+100)))) {
            /*for x in value {
                selected.push(key.clone());
            }*/
            let d:i16 = user_elo - key;
            let temp_delta = d.abs();
            if temp_delta < delta  {
                delta = temp_delta;
                key_selected = key;
            }
        }
        if key_selected != 0 {
            let sel = (*w2).get_mut(&key_selected).unwrap();
            let a = sel.pop().unwrap();
            drop(w2);
            /*let random = {
                let mut rng = rand::thread_rng();
                rng.gen::<i64>()
            };*/
            let random = rand::random::<i64>();
            let room_name_f = format!("{:x}", random);
            let mut w1 = couille.lock_room.write().await;
            if !(*w1).contains_key(&room_name_f) {
                
                let room = create_ChessGame(&room_name_f, Some(user.name.clone()), None);
                (*w1).insert(room_name_f.clone(), room);
            }
            /*if (a).tx.send(room_name_f).is_err() {
                println!("Erreur lors de l'envoie de la room");
            }*/
        }
        else {
            if (*w2).contains_key(&user_elo) {

            }
            let a = (*w2).get_mut(&user_elo).unwrap();
        }*/
    }
    async fn handle_socket_friend( mut socket: WebSocket, lock_room : Arc<RwLock<BTreeMap::<String, ChessGame>>>, user : User ) {
        let mut w1 = lock_room.write().await;
        let room_name = format!("{:x}", rand::random::<i64>());
        
        if !(*w1).contains_key(&room_name) {
            
            let room = create_chess_game(&room_name, Some(user.user_name), None);
            (*w1).insert(room_name.clone(), room);
            drop(w1);
            if socket.send(Message::Text(room_name)).await.is_err() {
                println!("Error lors de l'envoie du message");
            };
        }
    }
    pub async fn fallback( uri: axum::http::Uri) -> impl axum::response::IntoResponse {
        println!("FALLBACK");
        (axum::http::StatusCode::NOT_FOUND, format!("No route {}", uri))
    }

    fn create_chess_game(room_name : &String, user_name1:Option<String>, user_name2:Option<String>) -> ChessGame{
        let (tx, _rx) = broadcast::channel(10);
        let f = rand::random::<bool>();
        /*let c1 = Cavalier {
            x : 0,
            y : 0,
        };*/
        let mut room = ChessGame {
            room_name : room_name.clone(),
            map : [[0;8];8], tx,
            white_to_play : true,
            black : None,
            white : None,
            //piece : [chess::Piece::Cavalier(());32],
        };
        if !(f^true) { room.white = user_name1; room.black = user_name2; } 
        else { room.white = user_name2; room.black = user_name1; }
        room
    }
}