# Resume Frontend
> this project forked by https://github.com/near/fast-auth-signer/

## How to use Chain Abstraction in Frontend
- User Interface for Account Creation, Recovery: Present a user-friendly interface for account creation and recovery, guiding the user through the process with clear instructions.
- Only Email Handling: Initiates the signup and login process by accepting the user’s email, then sending an authentication link to that email to ensure user verification. A good example for easy onboarding of web3 apps.
- MPC Service: Connect the frontend with a Multi-Party Computation (MPC) service to securely create or recover user accounts without revealing private keys or sensitive information.

## Getting Started
1. add dependencies
```
yarn
```

2. fill the `.env` (same with `.env.sample`)

3. start
```
yarn start
```