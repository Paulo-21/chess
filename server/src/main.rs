use axum::{
    extract::ws::{WebSocketUpgrade, WebSocket},
    routing::get,
    response::{ Response},
    Router,
};
use std::net::SocketAddr;
#[tokio::main]
async fn main() {
    let room = Vec<Vec<WebSocket>>::new();
    let app = Router::new().route("/websocketChess/", get(handler));
    let addr = SocketAddr::from(([127, 0, 0, 1], 8082));
    
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
            println!("{:?}", msg);
            if socket.send(msg).await.is_err() {
                // client disconnected
                return;
            }
        }
    }
}