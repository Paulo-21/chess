use axum::{
    extract::ws::{Message, WebSocketUpgrade, WebSocket},
    extract::State,
    routing::get,
    response::{ /*Html,*/ Response},
    Router,
};
use futures::{ sink::SinkExt, stream::StreamExt };
use std::{net::SocketAddr};
use std::collections::BTreeMap;
use std::sync::Arc;
use tokio::sync:: { RwLock, broadcast };
//use serde::Deserialize;
#[allow(dead_code)]
struct ChessGame {
    room_name: String,
    map : [[i32;8];8],
    tx: broadcast::Sender<String>,
}

#[tokio::main]
async fn main() {
    let room_vec = BTreeMap::<String, ChessGame>::new();
    let room = Arc::new(RwLock::new(room_vec));
    let app = Router::new()
    .fallback(fallback)
    .route("/websocketChess/:room_name/", get(handler))
    .with_state(room);
    let addr = SocketAddr::from(([127, 0, 0, 1], 8082));
    
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
  
    async fn handler(axum::extract::Path(id):axum::extract::Path<String> , ws: WebSocketUpgrade , State(state): State<Arc<RwLock<BTreeMap::<String, ChessGame>>>> ) -> Response {
        ws.on_upgrade(|socket| handle_socket(socket, state, id))
    }
    async fn handle_socket( socket: WebSocket, lock_room : Arc<RwLock<BTreeMap::<String, ChessGame>>>, room_name : String) {
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
                // Add username before message.
                let _ = tx.send(format!("{}: {}", "name", text));
            }
        });

        // If any one of the tasks run to completion, we abort the other.
        tokio::select! {
            _ = (&mut send_task) => recv_task.abort(),
            _ = (&mut recv_task) => send_task.abort(),
        };
    }
    pub async fn fallback( uri: axum::http::Uri) -> impl axum::response::IntoResponse {
        println!("FALLBACK");
        (axum::http::StatusCode::NOT_FOUND, format!("No route {}", uri))
    }
}