# ETH Seoul 2024 - Gajami Team Project 
https://ethseoul2024.devfolio.co/overview


## How to use Near Chain Abstraction
https://docs.near.org/ko/abstraction/what-is
- Multi-chain signatures: One Account, multiple chains
- Fast-Auth: easy onboarding 
- Relayer: cover gas fees 

### Frontend 
- User Interface for Account Creation, Recovery: Present a user-friendly interface for account creation and recovery, guiding the user through the process with clear instructions.
- Only Email Handling: Initiates the signup and login process by accepting the user’s email, then sending an authentication link to that email to ensure user verification. A good example for easy onboarding of web3 apps.
- MPC Service: Connect the frontend with a Multi-Party Computation (MPC) service to securely create or recover user accounts without revealing private keys or sensitive information.

### Backend (inclduing Relayer)
- Meta-Transaction: The backend is designed to process meta-transactions efficiently, enabling users to interact with blockchain services seamlessly and without direct cost implications.
- MetaID and Credential Management: Embeds decentralized identities (DIDs) for user management, we embed decentralized identity (DID) to give users sovereignty over their personal information. The backend, combined with the MPC service, generates keys for the DIDs and manages them through Near on-chain contracts. It also handles the issuance and verification of credentials linked to user identities. 
- Airdrop Transaction Handling: Handle the logic and execution of airdrop transactions, including the management of meta-transactions to remove gas fee barriers.
- Cross-Chain Abstraction: Implement backend services capable of interacting with multiple blockchains, managing the complexities of chain signatures and ensuring secure, efficient cross-chain transactions.


## System Flow
### sign up


### login 


### AI consultant & multichains airdrop



## Team Member 
- Hankeol Jeong
- IDKN WHORU
- JongWon Lee
- seunghyun cho

