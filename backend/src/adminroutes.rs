use axum::{debug_handler, extract::{Extension, Query}, http::StatusCode, Json};
use chrono::{DateTime, Utc};
// use regex::Regex;
use serde::{Deserialize, Serialize};
use serde_json::json;
use sqlx::{query, PgPool, Row};
use time::{Date, PrimitiveDateTime, Time};
use chrono::NaiveDateTime;

#[derive(Serialize)]
pub struct FlightSummary {
    pub flight_id: i32,
    pub airline: String,
    pub departure: String,
    pub arrival: String,
    pub date: String,
    pub departure_time: String,
    pub arrival_time: String,
}

pub async fn get_flights(
    Extension(db_pool): Extension<PgPool>,
) -> Result<Json<Vec<FlightSummary>>, (StatusCode, String)> {
    let query = r#"
        SELECT
            f.flight_id,
            a.name AS airline,
            src.code AS departure,
            dest.code AS arrival,
            f.departure_time,
            f.arrival_time
        FROM flights f
        JOIN airlines a ON f.airline_id = a.airline_id
        JOIN airport src ON f.source = src.code
        JOIN airport dest ON f.destination = dest.code
        ORDER BY f.flight_id
    "#;

    match sqlx::query(query)
        .fetch_all(&db_pool)
        .await
    {
        Ok(rows) => {
            let flights = rows.into_iter()
                .map(|row| {
                    let departure_dt: NaiveDateTime = row.get("departure_time");
                    let arrival_dt: NaiveDateTime = row.get("arrival_time");



                    FlightSummary {
                        flight_id: row.get("flight_id"),
                        airline: row.get("airline"),
                        departure: row.get("departure"),
                        arrival: row.get("arrival"),
                        date: departure_dt.format("%Y-%m-%d").to_string(),
                        departure_time: departure_dt.format("%H:%M").to_string(),
                        arrival_time: arrival_dt.format("%H:%M").to_string(),
                    }
                })
                .collect();
            Ok(Json(flights))
        },
        Err(err) => Err((StatusCode::INTERNAL_SERVER_ERROR, err.to_string())),
    }
}

#[derive(Deserialize, Debug)]
pub struct FlightPayLoad {
    // pub flight_id: i32,
    pub airline_id: i32,
    pub source: String,
    pub destination: String,
    pub date: String,
    pub departure_time: String,
    pub arrival_time: String,
    pub duration: String,
    pub price: f64,
    pub seats_available: i32,
    // pub seats_available: i32,
}

pub async fn addflight(
    Extension(db_pool): Extension<PgPool>,
    Json(payload): Json<FlightPayLoad>,
) -> Result<Json<serde_json::Value>, (StatusCode, String)> {
    println!("Received payload: {:?}", payload);

    // Validate airline_id
    let airline_exists = sqlx::query!(
        r#"SELECT 1 AS exists FROM airlines WHERE airline_id = $1"#,
        payload.airline_id
    )
    .fetch_optional(&db_pool)
    .await
    .map_err(|err| {
        let error_msg = format!("Failed to validate airline_id: {}", err);
        println!("Error: {}", error_msg);
        (StatusCode::INTERNAL_SERVER_ERROR, error_msg)
    })?;

    if airline_exists.is_none() {
        return Err((
            StatusCode::BAD_REQUEST,
            format!("Airline ID '{}' not found", payload.airline_id),
        ));
    }

    // Validate source and destination
    let source_exists = sqlx::query!(
        r#"SELECT 1 AS exists FROM airport WHERE code = $1"#,
        payload.source
    )
    .fetch_optional(&db_pool)
    .await
    .map_err(|err| {
        let error_msg = format!("Failed to validate source: {}", err);
        println!("Error: {}", error_msg);
        (StatusCode::INTERNAL_SERVER_ERROR, error_msg)
    })?;

    let destination_exists = sqlx::query!(
        r#"SELECT 1 AS exists FROM airport WHERE code = $1"#,
        payload.destination
    )
    .fetch_optional(&db_pool)
    .await
    .map_err(|err| {
        let error_msg = format!("Failed to validate destination: {}", err);
        println!("Error: {}", error_msg);
        (StatusCode::INTERNAL_SERVER_ERROR, error_msg)
    })?;

    if source_exists.is_none() {
        return Err((
            StatusCode::BAD_REQUEST,
            format!("Source airport '{}' not found", payload.source),
        ));
    }

    if destination_exists.is_none() {
        return Err((
            StatusCode::BAD_REQUEST,
            format!("Destination airport '{}' not found", payload.destination),
        ));
    }

    // Parse date
    let date = Date::parse(
        &payload.date,
        &time::format_description::parse("[year]-[month]-[day]").unwrap(),
    )
    .map_err(|err| {
        let error_msg = format!("Invalid date format: {}", err);
        println!("Error: {}", error_msg);
        (StatusCode::BAD_REQUEST, error_msg)
    })?;

    // Parse departure_time and arrival_time
    let departure_time = Time::parse(
        &payload.departure_time,
        &time::format_description::parse("[hour]:[minute]").unwrap(),
    )
    .map_err(|err| {
        let error_msg = format!("Invalid departure_time format: {}", err);
        println!("Error: {}", error_msg);
        (StatusCode::BAD_REQUEST, error_msg)
    })?;

    let arrival_time = Time::parse(
        &payload.arrival_time,
        &time::format_description::parse("[hour]:[minute]").unwrap(),
    )
    .map_err(|err| {
        let error_msg = format!("Invalid arrival_time format: {}", err);
        println!("Error: {}", error_msg);
        (StatusCode::BAD_REQUEST, error_msg)
    })?;

    // Combine date and time
    let departure_timestamp = PrimitiveDateTime::new(date, departure_time);
    let arrival_timestamp = if arrival_time < departure_time {
        PrimitiveDateTime::new(date + time::Duration::days(1), arrival_time)
    } else {
        PrimitiveDateTime::new(date, arrival_time)
    };

    // Validate duration format
    // let duration_regex = Regex::new(r"^\d+h \d+m$").unwrap();
    // if !duration_regex.is_match(&payload.duration) {
    //     return Err((
    //         StatusCode::BAD_REQUEST,
    //         format!("Invalid duration format: '{}'. Expected 'Xh Ym'", payload.duration),
    //     ));
    // }

    // Validate duration matches timestamps
    let calculated_duration = arrival_timestamp - departure_timestamp;
    let duration_hours = calculated_duration.whole_hours();
    let duration_minutes = calculated_duration.whole_minutes() % 60;
    let expected_duration = format!("{}h {}m", duration_hours, duration_minutes);
    if expected_duration != payload.duration {
        return Err((
            StatusCode::BAD_REQUEST,
            format!(
                "Duration '{}' does not match calculated duration '{}'",
                payload.duration, expected_duration
            ),
        ));
    }

    // Validate price
    if payload.price < 0.0 || payload.price > 99999999.99 {
        return Err((
            StatusCode::BAD_REQUEST,
            format!("Price '{}' is out of range for NUMERIC(10,2)", payload.price),
        ));
    }

    // Validate seats_available
    if payload.seats_available < 0 {
        return Err((
            StatusCode::BAD_REQUEST,
            format!("Seats available '{}' cannot be negative", payload.seats_available),
        ));
    }

    let query = r#"
        INSERT INTO flights (airline_id, source, destination, departure_time, arrival_time, duration, price, seats_available, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING flight_id
    "#;

    match sqlx::query(query)
        .bind(payload.airline_id)
        .bind(&payload.source)
        .bind(&payload.destination)
        .bind(departure_timestamp)
        .bind(arrival_timestamp)
        .bind(&payload.duration)
        .bind(payload.price)
        .bind(payload.seats_available)
        .bind("Scheduled")
        .execute(&db_pool)
        .await
    {
        Ok(result) => Ok(Json(json!({
            "status": "Flight added successfully",
            "flight_id": result.rows_affected()
        }))),
        Err(err) => {
            let error_msg = format!("Database error: {}", err);
            println!("Error: {}", error_msg);
            Err((StatusCode::INTERNAL_SERVER_ERROR, error_msg))
        }
    }
}


#[derive(Deserialize, Debug)]
pub struct DeleteQuery {
    pub flight_id: i32,
}

pub async fn delete_flight(
    Extension(db_pool): Extension<PgPool>,
    Query(payload): Query<DeleteQuery>,
) -> Result<Json<serde_json::Value>, (StatusCode, String)> {

    // Check if flight exists
    let flight_exists = sqlx::query!(
        r#"SELECT 1 AS exists FROM flights WHERE flight_id = $1"#,
        payload.flight_id
    )
    .fetch_optional(&db_pool)
    .await
    .map_err(|err| {
        let error_msg = format!("Failed to validate flight_id: {}", err);
        println!("Error: {}", error_msg);
        (StatusCode::INTERNAL_SERVER_ERROR, error_msg)
    })?;

    if flight_exists.is_none() {
        return Err((
            StatusCode::BAD_REQUEST,
            format!("Flight ID '{}' not found", payload.flight_id),
        ));
    }

    // Delete the flight
    let _ = sqlx::query!(
        r#"DELETE FROM flights WHERE flight_id = $1"#,
        payload.flight_id
    )
    .execute(&db_pool)
    .await
        .map_err(|err| {
            let error_msg = format!("Failed to delete flight: {}", err);
            println!("Error: {}", error_msg);
            (StatusCode::INTERNAL_SERVER_ERROR, error_msg)
        })?;
    
        Ok(Json(json!({
            "status": "Flight deleted successfully",
            "flight_id": payload.flight_id
        })))
}

#[derive(Deserialize, Serialize, Debug)]
pub struct BookingSummary {
    pub booking_id: i32,
    pub first_name: String,
    pub flight_id: i32,
    pub date: String,
    pub payment_status: String,
}

pub async fn get_admin_booking(
    Extension(db_pool): Extension<PgPool>,
) -> Result<Json<Vec<BookingSummary>>, (StatusCode, String)> {
    let query = r#"
        SELECT
            b.booking_id,
            u.first_name,
            b.flight_id,
            b.booking_date,
            b.payment_status
        FROM bookings b join users u on b.user_id = u.id
    "#;

    match sqlx::query(query)
        .fetch_all(&db_pool)
        .await
    {
        Ok(rows) => {
            let flights = rows.into_iter()
                .map(|row| {
                    let dt: NaiveDateTime = row.get("booking_date");

                    BookingSummary {
                        booking_id: row.get("booking_id"),
                        first_name: row.get("first_name"),
                        flight_id: row.get("flight_id"),
                        date: dt.format("%Y-%m-%d").to_string(),
                        payment_status: row.get("payment_status"),
                    }
                })
                .collect();
            Ok(Json(flights))
        },
        Err(err) => Err((StatusCode::INTERNAL_SERVER_ERROR, err.to_string())),
    }
}


#[derive(Serialize)]
pub struct DashboardData {
    flight_count: i64,
    passenger_count: i64,
}

pub async fn get_dashboard_stats(
    Extension(db_pool): Extension<PgPool>,
) -> Result<Json<DashboardData>, (StatusCode, String)> {
    // Get flight count
    let flight_count = sqlx::query!(
        r#"SELECT COUNT(*) as count FROM flights"#
    )
    .fetch_one(&db_pool)
    .await
    .map_err(|err| {
        let error_msg = format!("Failed to fetch flight count: {}", err);
        (StatusCode::INTERNAL_SERVER_ERROR, error_msg)
    })?
    .count
    .unwrap_or(0);

    // Get passenger count (based on bookings)
    let passenger_count = sqlx::query!(
        r#"SELECT COUNT(*) as count FROM passengers"#
    )
    .fetch_one(&db_pool)
    .await
    .map_err(|err| {
        let error_msg = format!("Failed to fetch passenger count: {}", err);
        (StatusCode::INTERNAL_SERVER_ERROR, error_msg)
    })?
    .count
    .unwrap_or(0);

    Ok(Json(DashboardData {
        flight_count,
        passenger_count,
    }))
}

#[derive(Serialize, Deserialize)]
pub struct UserPayLoad{
    id : i32,
    first_name: String,
    last_name: String,
    email: String,
    phone: String,
    gender: String,
    age: i32
}

pub async fn get_users(
    Extension(db_pool): Extension<PgPool>,
) -> Result<Json<Vec<UserPayLoad>>, (StatusCode, String)> {
    let query = r#"
        SELECT
           id,
           first_name,
           last_name,
           email,
           phone,
           gender,
           age
        FROM users
    "#;

    match sqlx::query(query)
        .fetch_all(&db_pool)
        .await 
    {
        Ok(rows) => {
            let users = rows.into_iter()
                .map(|row| {
                    UserPayLoad {
                        id: row.get("id"),
                        first_name: row.get("first_name"),
                        last_name: row.get("last_name"),
                        email: row.get("email"),
                        phone: row.get("phone"),
                        gender: row.get("gender"),
                        age: row.get("age")
                    }
                })
                .collect();
            Ok(Json(users))
        },
        Err(err) => Err((StatusCode::INTERNAL_SERVER_ERROR, err.to_string())),
    }
}

#[derive(Serialize, Deserialize, sqlx::FromRow, Debug)]
pub struct Passengers {
    pub passenger_id: i32,
    pub booking_id: i32,
    pub passenger_type: String,
    pub full_name: String,
    pub passport_number: String,
    pub seat_preference: String,
    pub meal_preference: String,
    pub special_assistance: String,
    pub assigned_seat: String,
    pub meal: Option<String>,
    pub travel_class: Option<String>,
}

pub async fn get_passengers(
    Extension(db_pool): Extension<PgPool>,
) -> Result<Json<Vec<Passengers>>, (StatusCode, String)> {
    let query = r#"
        SELECT
            passenger_id,
            booking_id,
            passenger_type,
            full_name,
            passport_number,
            seat_preference,
            meal_preference,
            special_assistance,
            assigned_seat,
            meal,
            travel_class
        FROM passengers
    "#;

    let passengers = sqlx::query_as::<_, Passengers>(query)
        .fetch_all(&db_pool)
        .await
        .map_err(|err| {
            let error_msg = format!("Failed to fetch passengers: {}", err);
            eprintln!("Error: {}", error_msg); // Log to stderr
            (StatusCode::INTERNAL_SERVER_ERROR, error_msg)
        })?;

    Ok(Json(passengers))
}

#[derive(Deserialize, Debug)]
pub struct DeletePassengerQuery {
    pub passenger_id: i32,
}

pub async fn deleted_passenger(
    Extension(db_pool): Extension<PgPool>,
    Query(payload): Query<DeletePassengerQuery>,
) -> Result<Json<serde_json::Value>, (StatusCode, String)> {

    // Check if passenger exists
    let passenger_exists = sqlx::query!(
        r#"SELECT 1 AS exists FROM passengers WHERE passenger_id = $1"#,
        payload.passenger_id
    )
    .fetch_optional(&db_pool)
    .await
    .map_err(|err| {
        let error_msg = format!("Failed to validate flight_id: {}", err);
        println!("Error: {}", error_msg);
        (StatusCode::INTERNAL_SERVER_ERROR, error_msg)
    })?;

    if passenger_exists.is_none() {
        return Err((
            StatusCode::BAD_REQUEST,
            format!("Passenger ID '{}' not found", payload.passenger_id),
        ));
    }

    // Delete the flight
    let _ = sqlx::query!(
        r#"DELETE FROM passengers WHERE passenger_id = $1"#,
        payload.passenger_id
    )
    .execute(&db_pool)
    .await
        .map_err(|err| {
            let error_msg = format!("Failed to delete flight: {}", err);
            println!("Error: {}", error_msg);
            (StatusCode::INTERNAL_SERVER_ERROR, error_msg)
        })?;
    
        Ok(Json(json!({
            "status": "Passenger deleted successfully",
            "passenger_id": payload.passenger_id
        })))
}
