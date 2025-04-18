use axum::{http::StatusCode, Json, extract::{Query, Extension}};
use chrono::{NaiveDateTime, Utc};
use serde::{Serialize, Deserialize};
use serde_json::json;
use sqlx::{PgPool, Row};
use std::collections::HashMap;

#[derive(Serialize, Clone)]
pub struct AirportInfo {
    pub city: String,
    pub airport: String,
    pub code: String,
    pub country: String,
    pub time: String,
}

#[derive(Serialize, Clone)]
pub struct Flight {
    pub id: String,
    pub airline: String,
    pub departure: AirportInfo,
    pub arrival: AirportInfo,
    pub date: String,
    pub status: String,
    pub duration: String,
    pub price: f64,
}

#[derive(Serialize, Clone)]
pub struct Passenger {
    pub name: String,
    pub seat: String,
    pub passport_number: String,
    pub meal_preference: Option<String>,
}

#[derive(Serialize, Clone)]
pub struct BookingResponse {
    pub id: i32,
    pub booking_date: String,
    pub status: String,
    pub total_amount: f64,
    pub flight: Flight,
    pub passengers: Vec<Passenger>,
}

#[derive(Deserialize)]
pub struct BookingQuery {
    pub user_id: i32,
}

pub async fn get_booking(
    Extension(db): Extension<PgPool>,
    Query(params): Query<BookingQuery>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {
    let query = r#"
        SELECT 
            b.booking_id, b.booking_date, 
            b.payment_status as status, b.total_amount,
            
            f.flight_id::text, f.departure_time, f.arrival_time, 
            f.status as flight_status, f.duration, f.price,
            
            dep.name as dep_airport_name, dep.location as dep_city, 
            dep.code as dep_code, dep.country as dep_country,
            
            arr.name as arr_airport_name, arr.location as arr_city, 
            arr.code as arr_code, arr.country as arr_country,
            
            a.name as airline_name,
            
            p.full_name, p.assigned_seat, p.passport_number, p.meal_preference
        FROM bookings b
        JOIN flights f ON b.flight_id = f.flight_id
        JOIN airport dep ON f.source = dep.code
        JOIN airport arr ON f.destination = arr.code
        JOIN airlines a ON f.airline_id = a.airline_id
        LEFT JOIN passengers p ON b.booking_id = p.booking_id
        WHERE b.user_id = $1
        ORDER BY b.booking_date DESC
    "#;

    let rows = sqlx::query(query)
        .bind(params.user_id)
        .fetch_all(&db)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({
                    "success": false,
                    "message": format!("Database error: {}", e),
                })),
            )
        })?;

    if rows.is_empty() {
        return Ok(Json(json!({
            "success": true,
            "bookings": []
        })));
    }

    let mut bookings_map = HashMap::new();

    for row in rows {
        let booking_id: i32 = row.get("booking_id");

        let flight = Flight {
            id: row.get("flight_id"),
            airline: row.try_get("airline_name").unwrap_or_else(|_| "Unknown".to_string()),
            departure: AirportInfo {
                city: row.try_get("dep_city").unwrap_or_else(|_| "Unknown".to_string()),
                airport: row.try_get("dep_airport_name").unwrap_or_else(|_| "Unknown".to_string()),
                code: row.try_get("dep_code").unwrap_or_else(|_| "UNK".to_string()),
                country: row.try_get("dep_country").unwrap_or_else(|_| "Unknown".to_string()),
                time: format_time(row.get::<NaiveDateTime, _>("departure_time")),
            },
            arrival: AirportInfo {
                city: row.try_get("arr_city").unwrap_or_else(|_| "Unknown".to_string()),
                airport: row.try_get("arr_airport_name").unwrap_or_else(|_| "Unknown".to_string()),
                code: row.try_get("arr_code").unwrap_or_else(|_| "UNK".to_string()),
                country: row.try_get("arr_country").unwrap_or_else(|_| "Unknown".to_string()),
                time: format_time(row.get::<NaiveDateTime, _>("arrival_time")),
            },
            date: format_date(row.get::<NaiveDateTime, _>("departure_time")),
            status: row.try_get("flight_status").unwrap_or_else(|_| "Unknown".to_string()),
            duration: row.try_get("duration").unwrap_or_else(|_| "0h 0m".to_string()),
            price: row.try_get("price").unwrap_or(0.0),
        };

        let passenger_name: Option<String> = row.try_get("full_name").ok().flatten();

        let passenger = passenger_name.map(|name| Passenger {
            name,
            seat: row.try_get("assigned_seat").unwrap_or_else(|_| "N/A".to_string()),
            passport_number: row.try_get("passport_number").unwrap_or_else(|_| "N/A".to_string()),
            meal_preference: row.try_get("meal_preference").ok().flatten(),
        });

        bookings_map
            .entry(booking_id)
            .or_insert_with(|| BookingResponse {
                id: booking_id,
                booking_date: format_datetime(row.get::<NaiveDateTime, _>("booking_date")),
                status: row.try_get("status").unwrap_or_else(|_| "Unknown".to_string()),
                total_amount: row.try_get("total_amount").unwrap_or(0.0),
                flight: flight.clone(),
                passengers: Vec::new(),
            })
            .passengers
            .extend(passenger);
    }

    let bookings: Vec<_> = bookings_map.into_values().collect();

    Ok(Json(json!({
        "success": true,
        "bookings": bookings
    })))
}

// Helpers - Updated to use NaiveDateTime
fn format_datetime(dt: NaiveDateTime) -> String {
    dt.format("%Y-%m-%d %H:%M:%S").to_string()
}

fn format_date(dt: NaiveDateTime) -> String {
    dt.format("%Y-%m-%d").to_string()
}

fn format_time(dt: NaiveDateTime) -> String {
    dt.format("%H:%M").to_string()
}

#[derive(Deserialize)]
pub struct DeleteBookingQuery {
    pub booking_id: i32,
}

#[axum::debug_handler]
pub async fn delete_booking(
    Extension(db): Extension<PgPool>,
    Query(params): Query<DeleteBookingQuery>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {
    let result = sqlx::query("DELETE FROM bookings WHERE booking_id = $1")
        .bind(params.booking_id)
        .execute(&db)
        .await;

    match result {
        Ok(_) => Ok(Json(json!({
            "success": true,
            "message": "Booking deleted successfully"
        }))),
        Err(e) => Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({
                "success": false,
                "message": format!("Database error: {}", e),
            })),
        )),
    }
}