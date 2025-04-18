use axum::extract::{Extension, Json, Query};

use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use serde_json::json;
use chrono;


#[derive(Deserialize, Serialize)]
pub struct BookingPayload {
    pub flight_id: i32,
    pub passengers: Vec<PassengerInfo>,
    pub total_price: f64,
    pub user_id: i32,
}

#[derive(Deserialize, Serialize)]
pub struct PassengerInfo {

    pub id : i32,
    #[serde(rename = "type")]
    pub passenger_type: String,
    
    #[serde(rename = "name")]
    pub full_name: String,
    
    #[serde(rename = "passport")]
    pub passport_number: String,
    
    #[serde(rename = "seatPreference")]
    pub seat_preference: String,
    
    #[serde(rename = "mealPreference")]
    pub meal_preference: String,
    
    #[serde(rename = "specialAssistance")]
    pub special_assistance: String,
    
    // #[serde(rename = "assigned_seat")]
    // pub assigned_seat: String,
}



pub async fn book_flight(
    Extension(db): Extension<PgPool>,
    Json(payload) : Json<BookingPayload>,
) -> Json<serde_json::Value> {
    let _ = sqlx::query(
        "INSERT INTO bookings (user_id, booking_date, payment_status, total_amount, flight_id)
        VALUES ($1, $2, $3, $4, $5)"
    )
    .bind(payload.user_id)
    .bind(chrono::Utc::now().naive_utc())
    .bind("Paid")
    .bind(payload.total_price)
    .bind(payload.flight_id)
    .execute(&db)
    .await
    .expect("Failed to insert booking");

    let booking_id = sqlx::query!("SELECT booking_id FROM bookings WHERE user_id = $1 ORDER BY booking_date DESC LIMIT 1", payload.user_id)
        .fetch_one(&db)
        .await
        .expect("Failed to fetch booking ID")
        .booking_id;

    for passenger in payload.passengers {
        let _ = sqlx::query!(
            "INSERT INTO passengers (booking_id, passenger_type, full_name, passport_number, seat_preference, meal_preference, special_assistance, assigned_seat)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
            booking_id,
            passenger.passenger_type,
            passenger.full_name,
            passenger.passport_number,
            passenger.seat_preference,
            passenger.meal_preference,
            passenger.special_assistance,
            "8A"
        )
        .execute(&db)
        .await
        .expect("Failed to insert passenger");
    }

    Json(json!({ "status": "success", "message": "Flight booked successfully" }))
}

#[derive(Deserialize)]
pub struct PassengerQuery {
    pub passenger_id: i32,
}

#[derive(Serialize)]
pub struct PassengerDetail {
    passenger_id: i32,
    full_name: String,
    booking_id: i32,
    flight_id: i32,
    // departure_time: chrono::NaiveDateTime,
    // arrival_time: chrono::NaiveDateTime,
    flight_status: String,
    duration: i32,
    price: f64,
    dep_airport_name: String,
    dep_city: String,
    dep_code: String,
    dep_country: String,
    arr_airport_name: String,
    arr_city: String,
    arr_code: String,
    arr_country: String,
    airline_name: String,
    assigned_seat: String,
    meal_preference: String,
    travel_class: String,
}

pub async fn fetchpassengerdetail(
    Extension(db): Extension<PgPool>,
    Query(payload): Query<PassengerQuery>,
) -> Result<Json<PassengerDetail>, axum::http::StatusCode> {
    let booking = sqlx::query!(
        r#"
        SELECT 
            p.passenger_id, p.full_name, p.booking_id, p.assigned_seat, p.meal_preference, p.travel_class
        FROM passengers p 
        WHERE p.passenger_id = $1
        "#,
        payload.passenger_id
    )
    .fetch_one(&db)
    .await
    .map_err(|_| axum::http::StatusCode::NOT_FOUND)?;

    // let booking_id = booking.booking_id.ok_or(axum::http::StatusCode::NOT_FOUND)?;


    let flight = sqlx::query!(
        r#"
        SELECT 
            f.flight_id, f.departure_time, f.arrival_time, f.status as flight_status, f.duration, f.price,
            dep.name as dep_airport_name, dep.location as dep_city, 
            dep.code as dep_code, dep.country as dep_country,
            arr.name as arr_airport_name, arr.location as arr_city, 
            arr.code as arr_code, arr.country as arr_country,
            a.name as airline_name
        FROM flights f
        JOIN airport dep ON f.source = dep.code
        JOIN airport arr ON f.destination = arr.code
        JOIN airlines a ON f.airline_id = a.airline_id
        WHERE f.flight_id = (
            SELECT flight_id FROM bookings WHERE booking_id = $1
        )
        "#,
        booking.booking_id
    )
    .fetch_one(&db)
    .await
    .map_err(|_| axum::http::StatusCode::NOT_FOUND)?;

    Ok(Json(PassengerDetail {
        passenger_id: booking.passenger_id,
        full_name: booking.full_name.unwrap_or_default(),
        booking_id: booking.booking_id.unwrap_or_default(),
        flight_id: flight.flight_id,
        // departure_time: flight.departure_time.map(|dt| dt.into()).unwrap_or_else(|| chrono::NaiveDateTime::from_timestamp_opt(0, 0).unwrap()),
        // arrival_time: flight.arrival_time,
        assigned_seat: booking.assigned_seat.unwrap_or_default(),
        flight_status: flight.flight_status.unwrap_or_default(),
        duration: flight.duration.unwrap_or_default().parse::<i32>().unwrap_or_default(),
        price: flight.price.unwrap_or_default().to_string().parse::<f64>().unwrap_or_default(),
        dep_airport_name: flight.dep_airport_name.unwrap_or_default(),
        dep_city: flight.dep_city.unwrap_or_default(),
        dep_code: flight.dep_code.unwrap_or_default(),
        dep_country: flight.dep_country.unwrap_or_default(),
        arr_airport_name: flight.arr_airport_name.unwrap_or_default(),
        arr_city: flight.arr_city.unwrap_or_default(),
        arr_code: flight.arr_code.unwrap_or_default(),
        arr_country: flight.arr_country.unwrap_or_default(),
        airline_name: flight.airline_name.unwrap_or_default(),
        meal_preference: booking.meal_preference.unwrap_or_default(),
        travel_class: booking.travel_class.unwrap_or_default(),
    }))
}

// Using the existing CheckinPayload struct defined earlier
#[derive(Deserialize, Serialize)]
pub struct CheckinPayload {
    pub passenger_id: i32,
    pub travel_class: String,
    pub seat_number: String,
    pub meal: String,
}


pub async fn online_checkin(
    Extension(db): Extension<PgPool>,
    Json(payload): Json<CheckinPayload>,
) -> Result<Json<serde_json::Value>, axum::http::StatusCode> {
    sqlx::query!(
        r#"
        UPDATE passengers
        SET meal = $1, assigned_seat = $2, travel_class = $3
        WHERE passenger_id = $4
        "#,
        payload.meal,
        payload.seat_number,
        payload.travel_class,
        payload.passenger_id
    )
    .execute(&db)
    .await
    .map_err(|_| axum::http::StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(json!({ "status": "success", "message": "Passenger information updated successfully" })))
}
