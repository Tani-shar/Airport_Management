use adminRoutes::get_dashboard_stats;
use axum::{
    extract::Extension,
    routing::{delete, get, post},
    Router,
};
use dotenv::dotenv;
use sqlx::postgres::PgPoolOptions;
use std::net::SocketAddr;
use tower_http::cors::{CorsLayer, Any};

// use routes::register_user;

mod authroutes;
mod auth;
mod flightroutes;
mod bookflightroutes;
mod fetchbookings;
mod adminRoutes;
mod logs;

#[tokio::main]
async fn main() {
    dotenv().ok(); // Load env vars

    // Connect to the database
    let db_pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&std::env::var("DATABASE_URL").expect("DATABASE_URL not set"))
        .await
        .expect("Failed to create database pool");

    let cors = CorsLayer::new()
        .allow_origin(Any) // You can restrict to "http://localhost:3000" if needed
        .allow_methods(Any)
        .allow_headers(Any);
    // Setup the app router
    let app = Router::new()
        .route("/api/signup", post(authroutes::signup_user))
        .route("/api/login", post(authroutes::login_user))
        .route("/api/profile", get(authroutes::get_user))


        .route("/api/search_flights", post(flightroutes::search_flights))


        .route("/api/book_flight", post(bookflightroutes::book_flight))
        .route("/api/bookings/cancel", delete(fetchbookings::delete_booking))

        .route("/api/online_checkin", post(bookflightroutes::online_checkin))

        .route("/api/fetchpassengerdetail", get(bookflightroutes::fetchpassengerdetail))

        .route("/api/bookings", get(fetchbookings::get_booking))

        .route("/api/admin/flights", get(adminRoutes::get_flights))
       
       .route("/api/admin/flights/add", post(adminRoutes::addflight))

       .route("/api/admin/flights/delete", delete(adminRoutes::delete_flight))
       .route("/api/admin/bookings", get(adminRoutes::get_admin_booking))

       .route("/api/admin/dashboard", get(adminRoutes::get_dashboard_stats))

       .route("/api/admin/passengers", get(adminRoutes::get_passengers))
       .route("/api/admin/passengers/delete", delete(adminRoutes::deleted_passenger))
        
        .route("/api/admin/users", get(adminRoutes::get_users))

        .route("/api/admin/logs", get(logs::get_logs))
        .layer(Extension(db_pool)) // Share DB across routes
        .layer(cors);

    // Start the server
    let addr = SocketAddr::from(([0, 0, 0, 0], 3001));
    println!("Server running at http://{}", addr);
    axum::serve(tokio::net::TcpListener::bind(addr).await.unwrap(), app)
        .await
        .unwrap();
}
