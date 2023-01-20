use axum::{
    extract::ws::{WebSocketUpgrade, WebSocket},
    routing::get,
    response::{ Html, Response},
    Router,
    extract::Query,
};
use std::net::SocketAddr;
use std::collections::BTreeMap;
use std::sync::Arc;
//use serde::Deserialize;
struct ChessGame {
    room_name: String,
    map : [[i32;8];8],
    connected : Arc<Vec<WebSocket>>,
}

#[tokio::main]
async fn main() {
    let roomVec = Vec::<ChessGame>::new();
    let room = Arc::new(roomVec);
    let app = Router::new()
    .fallback(fallback)
    .route("/websocketChess/:room_name/", get(handler));
    let addr = SocketAddr::from(([127, 0, 0, 1], 8082));
    
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();

    pub async fn fallback( uri: axum::http::Uri) -> impl axum::response::IntoResponse {
        println!("FALLBACK");
        (axum::http::StatusCode::NOT_FOUND, format!("No route {}", uri))
    }
    
    async fn handler(axum::extract::Path(id):axum::extract::Path<String> , ws: WebSocketUpgrade  ) -> Response {
        println!("{} : {:?}", id , ws);
        ws.on_upgrade(handle_socket)
    }

    async fn handle_socket(mut socket: WebSocket) {
        
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
}