use axum::{
    extract::ws::{WebSocketUpgrade, WebSocket},
    extract::State,
    routing::get,
    response::{ /*Html,*/ Response},
    Router,
};
use std::net::SocketAddr;
use std::collections::BTreeMap;
use std::sync::Arc;
use tokio::sync::RwLock;
//use serde::Deserialize;
struct ChessGame {
    room_name: String,
    map : [[i32;8];8],
    //connected : Arc<Vec<WebSocket>>,
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
    async fn handle_socket(mut socket: WebSocket, lock_room : Arc<RwLock<BTreeMap::<String, ChessGame>>>, room_name : String) {
        let r1 = lock_room.read().await;
        let exist = (*r1).contains_key(&room_name.clone());
        drop(r1);
        if exist {
            let mut  w1 = lock_room.write().await;
            let chess = ChessGame { room_name : room_name.clone(), map : [[0;8];8]};
            (*w1).insert(room_name.clone(), chess);
        }
        
        while let Some(msg) = socket.recv().await {
            let msg = if let Ok(msg) = msg {
                msg
            } else {
                // client disconnected
                return;
            };
            println!("{:?}", msg);
            if socket.send(msg).await.is_err() {
                // client disconnected
                return;
            }
        }
    }
    pub async fn fallback( uri: axum::http::Uri) -> impl axum::response::IntoResponse {
        println!("FALLBACK");
        (axum::http::StatusCode::NOT_FOUND, format!("No route {}", uri))
    }
}