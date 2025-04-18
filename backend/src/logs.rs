use axum:: {extract :: Extension, http::StatusCode, Json};
use sqlx:: {PgPool, Row, FromRow};
use serde:: {Deserialize, Serialize};

#[derive(Serialize, Deserialize, FromRow)]
pub struct LogEntry{
    pub log_id: i32,
    pub table_name: String,
    pub action: String,
    // pub action: String,
    pub record_id: i32,
    pub changed_data: serde_json::Value,
    pub changed_at: chrono::DateTime<chrono::Utc>,
    pub changed_by: Option<String>,
}

pub async fn get_logs(
    Extension(db_pool) : Extension<PgPool>,
) -> Result<Json<Vec<LogEntry>>, (StatusCode, String)> {
    let query = r#"
        SELECT log_id, table_name, action, record_id, changed_data, changed_at, changed_by
        FROM logs
        ORDER BY changed_at DESC
    "#;

    let logs = sqlx::query_as::<_, LogEntry>(query)
        .fetch_all(&db_pool)
        .await
        .map_err(|err| {
            let error_msg = format!("Failed to fetch logs: {}", err);
            eprintln!("Error: {}", error_msg);
            (StatusCode::INTERNAL_SERVER_ERROR, error_msg)
        })?;

    Ok(Json(logs))

}