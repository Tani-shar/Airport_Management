use jsonwebtoken::{encode, decode, Header, Validation, EncodingKey, DecodingKey};
use serde::{Serialize, Deserialize};
use chrono::{Utc, Duration};


#[derive(Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub exp: usize,
}

pub fn generate_jwt(email: &str) -> String {
    let expiration = Utc::now() + Duration::hours(1); // Token valid for 1 hour 

    let claims = Claims {
        sub: email.to_string(),
        exp: expiration.timestamp() as usize,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(std::env::var("JWT_SECRET").expect("JWT_SECRET not set").as_ref()),
    )
    .expect("Failed to generate JWT")
}

pub fn verify_jwt(token: &str) -> Result<Claims, jsonwebtoken::errors::Error> {
    decode::<Claims>(
        token,
        &DecodingKey::from_secret(std::env::var("JWT_SECRET").expect("JWT_SECRET not set").as_ref()),
        &Validation::default(),
    )
    .map(|data| data.claims)
}