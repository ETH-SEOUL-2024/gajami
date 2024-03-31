mod github;

use axum::{
    extract::{Path, Extension},
    routing::get,
    Json, Router,
};
use github::{
    analyze_user_languages, create_client, evaluate_main_language_skill, fetch_github_users, LanguageSkill
};
use reqwest::Client;

#[derive(Debug, serde::Serialize)]
struct Error {
    message: String,
}

#[tokio::main]
async fn main() {
    let client = create_client().await.expect("Failed to create HTTP client");

    // let app = Router::new()
    // .route("/", get(|| async { "Hello, World!" }));

    // axum::Server::bind(&"0.0.0.0:3020".parse().unwrap())
    // .serve(app.into_make_service())
    // .await
    // .unwrap();

    let user_id = "loosie";
    let client: Client = create_client().await.unwrap(); 

    let language_skills = evaluate_main_language_skill_handler(&client, user_id).await;
    println!("{:?}", language_skills);
}

async fn evaluate_main_language_skill_handler(client: &Client, user_id: &str)  -> Vec<LanguageSkill>{
    match evaluate_main_language_skill(&client, user_id).await {
        Ok(language_skills) => {
            println!("Skill evaluation completed successfully");
            // Process the language_skills vector here
            language_skills
        },
        Err(e) => {
            eprintln!("An error occurred: {}", e);
            Vec::new()
        },
    }
}

async fn fetch_github_users_handler() {
    // match fetch_github_users(&client, user_id).await {
    //     Ok(()) => println!("User info fetched successfully"),
    //     Err(e) => eprintln!("An error occurred: {}", e),
    // }
}

async fn analyze_user_languages_handler() {
    // match analyze_user_languages(client, user_id).await {
    //     Ok(()) => println!("Language analysis completed successfully"),
    //     Err(e) => eprintln!("An error occurred: {}", e),
    // }
}