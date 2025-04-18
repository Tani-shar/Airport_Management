use axum::{
    extract::{Extension, Json, Query},
    http::StatusCode,
};

use argon2::{password_hash::{rand_core::OsRng, SaltString}, Params};
use argon2::{Argon2, PasswordHash, PasswordHasher, PasswordVerifier};
use serde::Deserialize;
use sqlx::PgPool;
use serde_json::json;
use tracing;

use crate::auth::generate_jwt;


#[derive(Deserialize)]

pub struct SignupPayload {
    pub first_name: String,
    pub last_name: String,
    pub email: String,
    pub phone: String,
    pub age: i32,
    pub gender: String,
    pub passport_number: String,
    pub nationality: String,
    pub password: String,
}

pub async fn signup_user(
    Extension(db): Extension<PgPool>,
    Json(payload): Json<SignupPayload>,
) -> Json<&'static str> {
    let salt = SaltString::generate(&mut OsRng);
    let password_hash = Argon2::default()
        .hash_password(payload.password.as_bytes(), &salt)
        .unwrap()
        .to_string();

    let _ = sqlx::query!(
        "INSERT INTO users (first_name, last_name, email, phone, age, gender, passport_number, nationality, password_hash)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)",
        payload.first_name,
        payload.last_name,
        payload.email,
        payload.phone,
        payload.age,
        payload.gender,
        payload.passport_number,
        payload.nationality,
        password_hash,
    )
    .execute(&db)
    .await
    .expect("Failed to insert user");

    Json("User created successfully")
}

#[derive(Deserialize)]
pub struct LoginPayload {
    pub email: String,
    pub password: String,
}

pub async fn login_user(
    Extension(db): Extension<PgPool>,
    Json(payload): Json<LoginPayload>,
) -> Json<serde_json::Value> {
    let user = sqlx::query!(
        "SELECT id, password_hash FROM users WHERE email = $1",
        payload.email
    )
    .fetch_one(&db)
    .await;

    let user = match user {
        Ok(user) => user,
        Err(_) => {
            return Json(json!({
                "success": false,
                "message": "User not found"
            }))
        }
    };

    let parsed_hash = PasswordHash::new(&user.password_hash);
    if let Ok(hash) = parsed_hash {
        if Argon2::default()
            .verify_password(payload.password.as_bytes(), &hash)
            .is_ok()
        {
            let token = generate_jwt(&payload.email);
            return Json(json!({
                "success": true,
                "message": "Login successful",
                "token": token,
                "user_id": user.id
            }));
        }
    }

    Json(json!({
        "success": false,
        "message": "Invalid credentials"
    }))
}

#[derive(Deserialize)]
pub struct UserQuery {
    pub user_id: i32,
}

pub async fn get_user(
    Extension(db): Extension<PgPool>,
    Query(params): Query<UserQuery>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {
    let res = sqlx::query!(
        "SELECT * FROM users WHERE id = $1",
        params.user_id
    )
    .fetch_one(&db)
    .await
    .map_err(|e| {
        tracing::error!("Failed to fetch user: {:?}", e);
        e
    });


    
    let user = match res {
        Ok(user) => user,
        Err(_) => {
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({
                    "success": false,
                    "message": "User not found"
                })),
            ))
        }
    };

    
    
    Ok(Json(json!({
        "success": true,
        "user": {
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "phone": user.phone,
            "age": user.age,
            "gender": user.gender,
            "passport_number": user.passport_number,
            "nationality": user.nationality
        }
    })))
}