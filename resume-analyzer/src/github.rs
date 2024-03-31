
use reqwest::{Client, ClientBuilder, Error, header};
use serde_json::Value;
use std::collections::HashMap;
use serde::Deserialize;
use std::env;
use dotenv::dotenv;
use std::time::Duration;


#[derive(Deserialize, Debug)]
struct GithubUser {
    login: String,
    id: u64,
}

#[derive(Deserialize, Debug)]
struct Repository {
    name: String,
    languages_url: String,
    fork: bool
}

pub async fn create_client() -> Result<Client, Error> {
    dotenv().ok();
    ClientBuilder::new()
        .user_agent("My GitHub App")
        .timeout(Duration::new(5, 0))
        .build()
}

fn github_api_request_headers() -> header::HeaderMap {
    let mut headers = header::HeaderMap::new();
    if let Ok(token) = env::var("GIT_ACCESS_TOKEN") {
        headers.insert(header::AUTHORIZATION, format!("Bearer {}", token).parse().unwrap());
    }
    headers
}

pub async fn fetch_github_users(client: &Client, user_id: &str) -> Result<(), Error> {
    let request_url = format!("https://api.github.com/users/{}", user_id);
    println!("{}", request_url);

    let response = client.get(&request_url)
        .headers(github_api_request_headers())
        .send().await?;

    
        match response.status().as_u16() {
            200 => {
                let user: GithubUser = response.json().await?;
                println!("{} is a user!", user_id);
                println!("{:?}", user);
            },
            403 => {
                println!("Request failed: Rate limiting exceeded or access denied.");
                if let Some(limit_reset) = response.headers().get("x-ratelimit-reset") {
                    let reset_time = limit_reset.to_str().unwrap_or("unknown");
                    println!("Rate limit will reset at UNIX timestamp: {}", reset_time);
                }
            },
            401 => {
                println!("Request failed: Unauthorized. Check your access token.");
            },
            _ => {
                let status_code = response.status();
                println!("Request failed with status: {}", status_code);
            }
        }

    Ok(())
}


#[derive(Debug)]
pub struct LanguageSkill {
    language: String,
    skill_score: f64,
    grade: char,
}

pub async fn evaluate_main_language_skill(client: &Client, user_id: &str) -> Result<Vec<LanguageSkill>, Error> {
    let repos = fetch_user_repositories(client, user_id).await?;
    let mut language_skills = Vec::new();
    let main_languages = vec![
        "Java", "TypeScript", "Go", "Rust", "JavaScript",
        "Solidity", "C", "C++", "Ruby", "Elixir", "Kotlin",
    ];

    for &language in main_languages.iter() {
        let mut total_language_bytes = 0u64;
        let mut total_commits = 0u32;

        for repo in &repos {
            if let Ok(languages) = fetch_repository_languages(client, &repo.languages_url).await {
                if let Some(&bytes) = languages.get(language) {
                    total_language_bytes += bytes;
                    let commit_count = fetch_commit_count(client, &format!("{}/{}", user_id, repo.name), user_id).await?;
                    total_commits += commit_count;
                }
            }
        }

        let skill_score = calculate_skill_score(total_language_bytes, total_commits);
        let grade = match skill_score as u32 {
            0..=1000 => 'D',
            1001..=10000 => 'C',
            10001..=50000 => 'B',
            _ => 'A',
        };
        language_skills.push(LanguageSkill {
            language: language.to_string(),
            skill_score,
            grade,
        });

    }

    for skill in language_skills.iter() {
        println!("Skill score for {}: {:.2} (Grade: {})", skill.language, skill.skill_score, skill.grade);
    }

    Ok(language_skills)
}

fn calculate_skill_score(language_bytes: u64, commit_count: u32) -> f64 {
    (language_bytes as f64 * 0.1) + (commit_count as f64 * 0.9)
}

async fn fetch_commit_count(client: &Client, repo_full_name: &str, user_login: &str) -> Result<u32, Error> {
    let commits_url = format!("https://api.github.com/repos/{}/commits?author={}", repo_full_name, user_login);
    let resp = client.get(&commits_url)
        .send().await?
        .error_for_status()?
        .json::<Vec<Value>>().await?;
    
    Ok(resp.len() as u32)
}

pub async fn analyze_user_languages(client: Client, user_id: &str) -> Result<(), Error> {
    println!("Analyzing language usage for user: {}", user_id);
    let repos = fetch_user_repositories(&client, user_id).await?;
    let mut language_usage = HashMap::new();

    for repo in repos.iter() {
        match fetch_repository_languages(&client, &repo.languages_url).await {
            Ok(languages) => {
                println!("{:?}", languages);
                for (language, bytes) in languages {
                    *language_usage.entry(language).or_insert(0) += bytes;
                }
            },
            Err(e) => {
                eprintln!("Failed to fetch languages for repository {}: {}", &repo.name, e);
            }
        }
    }

    let main_languages = vec![
    "Java", "TypeScript", "Go", "Rust", "JavaScript",
    "Solidity", "C", "C++", "Ruby", "Elixir", "Kotlin",
    ];

    let main_language_usage: HashMap<&str, u64> = main_languages.iter()
        .filter_map(|&lang| language_usage.get(lang).map(|&bytes| (lang, bytes)))
        .collect();

    for (language, bytes) in main_language_usage.iter() {
        println!("{}: {} bytes", language, bytes);
    }

    let main_language = main_language_usage.iter()
        .max_by_key(|&(_, bytes)| bytes)
        .map(|(&lang, _)| lang)
        .unwrap_or("Unknown");

    println!("MainLanguage: {}", main_language);

    Ok(())
}


async fn fetch_user_repositories(client: &Client, user_id: &str) -> Result<Vec<Repository>, Error> {
    println!("Fetching repositories for user: {}", user_id);
    let mut repos = Vec::new();
    let mut page = 1;

    while let Ok(response) = client.get(&format!("https://api.github.com/users/{}/repos?page={}&per_page=100", user_id, page))
                                    .headers(github_api_request_headers())
                                    .send().await {
        match response.status() {
            reqwest::StatusCode::OK => {
                let page_repos: Vec<Repository> = response.json().await?;
                let owned_repos: Vec<Repository> = page_repos.into_iter().filter(|repo| !repo.fork).collect(); // 포크되지 않은 리포지토리만 필터링

                if owned_repos.is_empty() { break; }

                repos.extend(owned_repos);
                page += 1;
            },
            _ => return Err(handle_response_status(response).await),
        }
    }

    Ok(repos)
}

async fn fetch_repository_languages(client: &Client, languages_url: &str) -> Result<HashMap<String, u64>, Error> {
    println!("Fetching languages from: {}", languages_url);

    let response = client.get(languages_url)
                        .headers(github_api_request_headers())
                        .send().await?;

    match response.status() {
        reqwest::StatusCode::OK => response.json().await,
        _ => Err(handle_response_status(response).await),
    }
}


async fn handle_response_status(response: reqwest::Response) -> Error {
    match response.status() {
        reqwest::StatusCode::FORBIDDEN => {
            println!("Access denied or rate limiting exceeded");
            if let Some(limit_reset) = response.headers().get("x-ratelimit-reset") {
                let reset_time = limit_reset.to_str().unwrap_or("unknown");
                eprintln!("Rate limit will reset at UNIX timestamp: {}", reset_time);
            }
        },
        reqwest::StatusCode::UNAUTHORIZED => {
            eprintln!("Unauthorized: Check your access token.");
        },
        reqwest::StatusCode::UNAVAILABLE_FOR_LEGAL_REASONS => {
            eprintln!("The requested resource is unavailable due to legal reasons. This might be due to copyright or other legal restrictions.");
        },
        _ => {
            let status_code = response.status();
            eprintln!("Request failed with status: {}", status_code);
        },
    }
    response.error_for_status().unwrap_err()
}
