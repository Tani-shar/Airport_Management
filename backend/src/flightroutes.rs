use axum::{
    extract::{Json, Extension},
    response::Json as AxumJson,
};
use serde::{Deserialize, Serialize};
use serde_json::json;
use sqlx::{PgPool, types::BigDecimal};
use time::{Date, Time};

#[derive(Debug, Deserialize)]
pub struct FlightPayLoad {
    pub departure: String,
    pub arrival: String,
    pub departure_date: String,
    pub passengers: i32,
}

#[derive(Serialize, sqlx::FromRow)]
struct FlightResult {
    flight_id: i32,
    airline_id: Option<i32>,
    airline_name: Option<String>,
    source: Option<String>,
    destination: Option<String>,
    status: Option<String>,
    runway_id: Option<i32>,
    gate_id: Option<i32>,
    duration: Option<String>,
    price: Option<BigDecimal>,
    seats_available: Option<i32>,
    departure_time: Option<String>,
    arrival_time: Option<String>,
}

pub async fn search_flights(
    Extension(db): Extension<PgPool>,
    Json(payload): Json<FlightPayLoad>,
) -> AxumJson<serde_json::Value> {
    println!("Received flight search request: {:?}", payload);

    let departure_date = match Date::parse(
        &payload.departure_date,
        &time::format_description::parse("[year]-[month]-[day]").unwrap(),
    ) {
        Ok(dt) => dt,
        Err(_) => {
            return AxumJson(json!({
                "error": "Invalid date format. Use YYYY-MM-DD"
            }))
        }
    };

    let start_datetime = departure_date.with_time(Time::MIDNIGHT);
    let end_datetime = departure_date.with_time(Time::from_hms(23, 59, 59).unwrap());

    match sqlx::query_as!(
        FlightResult,
        r#"
        SELECT 
            f.flight_id,
            f.airline_id,
            a.name as airline_name,
            f.source,
            f.destination,
            f.status,
            f.runway_id,
            f.gate_id,
            f.duration,
            f.price as "price: _",
            f.seats_available,
            TO_CHAR(f.departure_time, 'YYYY-MM-DD"T"HH24:MI:SS') as departure_time,
            TO_CHAR(f.arrival_time, 'YYYY-MM-DD"T"HH24:MI:SS') as arrival_time
        FROM flights f
        JOIN airlines a ON f.airline_id = a.airline_id
        WHERE 
            f.source = $1 
            AND f.destination = $2 
            AND f.departure_time BETWEEN $3 AND $4
        "#,
        payload.departure,
        payload.arrival,
        start_datetime,
        end_datetime
    )
    .fetch_all(&db)
    .await
    {
        Ok(flights) => AxumJson(json!({ "flights": flights })),
        Err(err) => AxumJson(json!({ "error": format!("Database error: {}", err) })),
    }
}