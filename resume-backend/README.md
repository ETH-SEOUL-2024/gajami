# Resume Backend
> use only testnet. still working with early stage code.

## How to use Chain Abstraction in Backend
- Meta-Transaction: The backend is designed to process meta-transactions efficiently, enabling users to interact with blockchain services seamlessly and without direct cost implications.
- MetaID and Credential Management: Embeds decentralized identities (DIDs) for user management, we embed decentralized identity (DID) to give users sovereignty over their personal information. The backend, combined with the MPC service, generates keys for the DIDs and manages them through Near on-chain contracts. It also handles the issuance and verification of credentials linked to user identities. (impl done, but not integrated yet)
- Airdrop Transaction Handling: Handle the logic and execution of airdrop transactions, including the management of meta-transactions to remove gas fee barriers.
- Cross-Chain Abstraction: Implement backend services capable of interacting with multiple blockchains, managing the complexities of chain signatures and ensuring secure, efficient cross-chain transactions.


## Tech Stack 
- lang & framework: typescript & nest.js
- orm: prisma
- blockchain: [ethereumjs](https://github.com/ethereumjs), [near-api-js](https://github.com/near/near-api-js)
- database: postgresql


## Getting Started
1. Clone the repository 
```
git clone <repository-url>
```

2. fill the `.env`, `.env.local`
```
// .env
NODE_ENV=local
DATABASE_URL="postgres://myuser:mypassword@localhost:5432/resume-db"
```
```
// .env.local
NEAR_ACCOUNT_ID=
NEAR_ACCOUNT_PRIVATE_KEY=
NEAR_MPC_CONTRACT=multichain-testnet-2.testnet

ETH_CHAIN_ID=11155111
ETH_CHAIN_NAME=sepolia
ETH_RPC_URL=https://rpc2.sepolia.org
ETH_EXPLORER_URL=https://sepolia.etherscan.io
ETH_GAS_QUERY_URL='https://sepolia.beaconcha.in/api/v1/execution/gasnow'

NEAR_NETWORK_ID=testnet
NEAR_RPC_URL=https://rpc.testnet.near.org
```


3. install dependencies
```
npm install 
// or 
yarn
```

4. run the application
```
nest start
```


## Setting Up the Database (not now)
Ensure Docker is installed and running, then initialize the PostgreSQL container:
```
docker-compose up -d 
```

### Seeding the Database
Populate your database with initial data using the seed script located at `/prisma/seed.ts`. Modify the script to include your testnet NEAR account ID and email before seeding:
```
const user1 = await prisma.user.upsert({
    where: { nearAccountId: 'demoId.testnet' },
    update: {},
    create: {
      email: 'demoId@gmail.com',
      nearAccountId: 'demoId.testnet',
    },
  });
```

Execute the seeding process:
```
npx prisma db seed
```


## Documentation and Tools
Swagger API Documentation
Access the Swagger UI to test and explore the API endpoints by navigating to http://localhost:3031/api after starting the Nest.js server.


## Authors
- [won](https://github.com/loosie/)