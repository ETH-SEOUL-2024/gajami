# Resume Skill Analyzer 
> Projects that were not included in our hackathon demo, but are on our roadmap.

this app analyzes users' GitHub code to assess their skills.

## Getting Started
1. fill the `.env` . ([github rest api rate_limit](https://docs.github.com/ko/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2022-11-28) usage 60 -> 5000 (per hour)) 
```
GIT_ACCESS_TOKEN={YOUR_PERSONAL_GIT_ACCESS_TOKEN}
```

2. app 실행 
```
cargo run 
```


## 1. Analyzing language usage
> Use the GitHub API to collect language usage data for each repository. 

Analyze the usage of major programming languages (e.g., lines of code, bytes) in each repository of a user. Along with the language the user has used the most (MainLanguage), we present the variety of languages the user has covered and the percentage of usage for each language to help you assess their overall skill set.

### example
```
...

Fetching languages from: https://api.github.com/repos/loosie/ror_practice/languages
Fetching languages from: https://api.github.com/repos/loosie/tdd_practice/languages
Fetching languages from: https://api.github.com/repos/loosie/techdot/languages
Fetching languages from: https://api.github.com/repos/loosie/zk-snark-example/languages

...

Skill score for Java: 317367.00 (Grade: A)
Skill score for TypeScript: 3550.10 (Grade: C)
Skill score for Go: 6501.90 (Grade: C)
Skill score for Rust: 25006.60 (Grade: B)
Skill score for JavaScript: 104195.30 (Grade: A)
Skill score for Solidity: 1129.70 (Grade: C)
Skill score for C: 5454.60 (Grade: C)
Skill score for C++: 11264.30 (Grade: B)
Skill score for Ruby: 27103.00 (Grade: B)
Skill score for Elixir: 37702.70 (Grade: B)
Skill score for Kotlin: 136.10 (Grade: D)
Skill evaluation completed successfull
```

## 2. Analyze project contributions and activity (not yet)
> use the GitHub API to collect user activity data.

Evaluate a user's project contributions and activity by analyzing their commit history, pull requests, issue participation, and more. Calculate an activity index, which can be used to assess a user's active open source activity or collaboration experience.


## 3. Analyze code quality and reviews (not yet)
> Analyze the quality and interaction of code reviews, issues, and pull requests in GitHub repositories. (Coming soon with Git Copilot)

Evaluate the quality of code written by users and analyze their ability to review code, resolve issues, and more. Evaluate a user's code quality and problem-solving skills based on the percentage of positive feedback in code reviews, issue resolution speed, and more.

 
## 4. Use AI to estimate skills (not yet)
> Build models using ML libraries 

Train the machine learning model to estimate a user's skill level based on their code and activity data. You can transform your users' code and activity data into a variety of features and use them as input to develop models that predict skill levels. For example, features could include language diversity, code quality metrics, project contributions, and more.
