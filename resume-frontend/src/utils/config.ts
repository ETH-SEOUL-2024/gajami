import { KeyType, PublicKey } from '@near-js/crypto';

import type { Network, NetworkId } from './types';

export const networks: Record<NetworkId, Network> = {
  mainnet: {
    networkId:     'mainnet',
    viewAccountId: 'near',
    nodeUrl:       'https://rpc.mainnet.near.org',
    walletUrl:     'https://wallet.near.org',
    helperUrl:     'https://helper.mainnet.near.org',
    relayerUrl:    process.env.RELAYER_URL,
    explorerUrl:   'https://explorer.near.org',
    fastAuth:      {
      mpcRecoveryUrl:  'https://near-mpc-recovery-mainnet.api.pagoda.co',
      authHelperUrl:   'https://api.kitwallet.app',
      accountIdSuffix: 'near',
      mpcPublicKey:    new PublicKey({
        keyType: KeyType.ED25519,
        data:    new Uint8Array([
          234,
          209,
          125,
          59,
          237,
          74,
          105,
          230,
          240,
          14,
          115,
          94,
          123,
          18,
          34,
          123,
          37,
          83,
          194,
          145,
          205,
          167,
          49,
          21,
          0,
          0,
          248,
          88,
          142,
          137,
          105,
          220
        ])
      }),
      firebase:        {
        apiKey:            process.env.FIREBASE_API_KEY,
        authDomain:        process.env.FIREBASE_AUTH_DOMAIN,
        projectId:         process.env.FIREBASE_PROJECT_ID,
        storageBucket:     process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId:             process.env.FIREBASE_APP_ID,
        measurementId:     process.env.FIREBASE_MEASUREMENT_ID,
      },
    },
  },
  testnet: {
    networkId:     'testnet',
    viewAccountId: 'testnet',
    nodeUrl:       'https://rpc.testnet.near.org',
    walletUrl:     'https://wallet.testnet.near.org',
    helperUrl:     'https://helper.testnet.near.org',
    relayerUrl:    process.env.RELAYER_URL,
    explorerUrl:    'https://explorer.testnet.near.org',
    fastAuth:      {
      mpcRecoveryUrl:    'https://mpc-recovery-leader-testnet.api.pagoda.co',
      authHelperUrl:   'https://testnet-api.kitwallet.app',
      accountIdSuffix: 'testnet',
      mpcPublicKey:    new PublicKey({
        keyType: KeyType.ED25519,
        data:    new Uint8Array([
          187,
          24,
          21,
          82,
          105,
          165,
          254,
          26,
          167,
          89,
          195,
          236,
          44,
          83,
          69,
          87,
          30,
          151,
          139,
          229,
          233,
          182,
          65,
          230,
          7,
          234,
          204,
          91,
          38,
          70,
          254,
          254
        ])
      }),
      firebase:        {
        apiKey:            process.env.FIREBASE_API_KEY,
        authDomain:        process.env.FIREBASE_AUTH_DOMAIN,
        projectId:         process.env.FIREBASE_PROJECT_ID,
        storageBucket:     process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId:             process.env.FIREBASE_APP_ID,
        measurementId:     process.env.FIREBASE_MEASUREMENT_ID,
      },
    },
  },
  // localnet: {
  //   // these are defined by https://github.com/kurtosis-tech/near-package
  //   networkId: 'localnet',
  //   viewAccountId: 'test.near',
  //   nodeUrl: 'http://127.0.0.1:8332',
  //   walletUrl: 'http://127.0.0.1:8334',
  //   helperUrl: 'http://127.0.0.1:8330',
  // },
};

export const networkId: NetworkId = (process.env.NETWORK_ID as NetworkId);
export const network = networks[networkId];
export const basePath = process.env.REACT_APP_BASE_PATH;
export const backendUrl = process.env.RESUME_BACKEND_URL;
