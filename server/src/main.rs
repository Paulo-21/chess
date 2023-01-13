use axum::{
    extract::ws::{WebSocketUpgrade, WebSocket},
    routing::get,
    response::{ Response},
    Router,
};
use std::net::SocketAddr;
#[tokio::main]
async fn main() {

    let app = Router::new().route("/ws", get(handler));
    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();

    async fn handler(ws: WebSocketUpgrade) -> Response {
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

            if socket.send(msg).await.is_err() {
                // client disconnected
                return;
            }
        }
    }
}