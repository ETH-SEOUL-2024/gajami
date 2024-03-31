import { Account, Connection } from '@near-js/accounts';
import { createKey, getKeys } from '@near-js/biometric-ed25519';
import {
  KeyPair, KeyPairEd25519, KeyType, PublicKey
} from '@near-js/crypto';
import { InMemoryKeyStore } from '@near-js/keystores';
import {
  SCHEMA, actionCreators, encodeSignedDelegate, buildDelegateAction, Signature, SignedDelegate, Transaction
} from '@near-js/transactions';
import BN from 'bn.js';
import { baseEncode, serialize } from 'borsh';
import { sha256 } from 'js-sha256';
import {
  keyStores
} from 'near-api-js';

import networkParams from './networkParams';
import {
  UserInfo, UserBalance, ChatResponse, SkillClaimResponse
} from './serverType';
import { fetchAccountIds } from '../api';
import { creatAuthToken } from '../components/AuthCallback/Auth';
import { deleteOidcKeyPairOnLocalStorage } from '../utils';
import { network, backendUrl } from '../utils/config';
import { firebaseAuth } from '../utils/firebase';
import {
  CLAIM, getSignRequestFrpSignature, getUserCredentialsFrpSignature, verifyMpcSignature,
} from '../utils/mpc-service';

const {
  addKey, functionCall, functionCallAccessKey
} = actionCreators;
class FastAuthController {
  private accountId: string;

  private networkId: string;

  private keyStore: InMemoryKeyStore;

  private localStore: keyStores.BrowserLocalStorageKeyStore;

  private connection: Connection;

  constructor({ accountId, networkId }) {
    const config = networkParams[networkId];
    if (!config) {
      throw new Error(`Invalid networkId ${networkId}`);
    }

    this.keyStore = new InMemoryKeyStore();
    this.localStore = new keyStores.BrowserLocalStorageKeyStore();

    this.connection = Connection.fromConfig({
      networkId,
      provider: { type: 'JsonRpcProvider', args: { url: config.nodeUrl, headers: config.headers } },
      signer:   { type: 'InMemorySigner', keyStore: this.keyStore },
    });

    this.networkId = networkId;
    this.accountId = accountId;
  }

  setAccountId = (accountId) => {
    this.accountId = accountId;
  };

  async createBiometricKey() {
    const keyPair = await createKey(this.accountId);
    await this.setKey(keyPair);

    return keyPair;
  }

  async getCorrectAccessKey(firstKeyPair, secondKeyPair) {
    const firstPublicKeyB58 = `ed25519:${baseEncode((firstKeyPair.getPublicKey().data))}`;
    const secondPublicKeyB58 = `ed25519:${baseEncode((secondKeyPair.getPublicKey().data))}`;

    if (this.accountId) {
      const account = new Account(this.connection, this.accountId);
      const accessKeys = await account.getAccessKeys();
      const accessKey = accessKeys.find((key) => key.public_key === firstPublicKeyB58 || secondPublicKeyB58);
      if (!accessKey) {
        throw new Error('No access key found');
      } else if (accessKey.public_key === firstPublicKeyB58) {
        return firstKeyPair;
      } else {
        return secondKeyPair;
      }
    }

    // If no account id, then we guess by checking if which key exists
    const accountIdsFromFirstKey = await fetchAccountIds(firstPublicKeyB58);
    if (accountIdsFromFirstKey.length) {
      this.setAccountId(accountIdsFromFirstKey[0]);
      return firstKeyPair;
    }
    const accountIdsFromSecondKey = await fetchAccountIds(secondPublicKeyB58);
    if (accountIdsFromSecondKey.length) {
      this.setAccountId(accountIdsFromSecondKey[0]);
      return secondKeyPair;
    }
    throw new Error('both key paris are invalid');
  }

  private async getBiometricKey() {
    const [firstKeyPair, secondKeyPair] = await getKeys(this.accountId);
    const privKeyStr = await this.getCorrectAccessKey(firstKeyPair, secondKeyPair);
    return new KeyPairEd25519(privKeyStr.split(':')[1]);
  }

  async getKey(accountId?: string) {
    return this.keyStore.getKey(this.networkId, accountId || this.accountId);
  }

  async setKey(keyPair) {
    return this.keyStore.setKey(this.networkId, this.accountId, keyPair);
  }

  async clearKey() {
    return this.keyStore.clear();
  }

  async clearUser() {
    await this.keyStore.clear();
    window.localStorage.removeItem('webauthn_username');
  }

  async isSignedIn() {
    return !!(await this.getKey());
  }

  async getLocalStoreKey(accountId) {
    return this.localStore.getKey(this.networkId, accountId);
  }

  async findInKeyStores(key) {
    const keypair = await this.getKey(key) || await this.getLocalStoreKey(key);
    return keypair;
  }

  assertValidSigner(signerId) {
    if (signerId && signerId !== this.accountId) {
      throw new Error(`Cannot sign transactions for ${signerId} while signed in as ${this.accountId}`);
    }
  }

  async signMessage(email?: string) {
    const message = new Uint8Array(sha256.array(email || window.firestoreController.getUserEmail()));
    return (await this.getKey()).sign(message);
  }

  async getEncodedSignature(email?: string) {
    const message = new Uint8Array(sha256.array(email || window.firestoreController.getUserEmail()));
    return baseEncode((await this.getKey()).sign(message).signature);
  }

  async getPublicKey() {
    let keyPair = await this.getKey();

    if (!keyPair) {
      const biometricKeyPair = await this.getBiometricKey();
      await this.setKey(biometricKeyPair);

      keyPair = biometricKeyPair;
    }

    return keyPair.getPublicKey().toString();
  }

  async fetchNonce({ accountId, publicKey }) {
    const rawAccessKey = await this.connection.provider.query({
      request_type: 'view_access_key',
      account_id:   accountId,
      public_key:   publicKey,
      finality:     'optimistic',
    });
    // @ts-ignore
    const nonce = rawAccessKey?.nonce;
    return new BN(nonce).add(new BN(1));
  }

  getAccountId() {
    return this.accountId;
  }

  async getAccounts() {
    if (this.accountId) {
      return [this.accountId];
    }

    return [];
  }

  async postChatToGPT(keywords: string): Promise<ChatResponse> {
    try {
      const { publicKey, signature } = await creatAuthToken(window.firestoreController.getUserEmail());
      const response = await fetch('http://127.0.0.1:3010/chat', {
        method:  'POST',
        mode:    'cors',
        body:    JSON.stringify({ keywords }),
        headers: {
          'Content-Type':        'application/json',
          // Authorization:         `Bearer ${await this.getEncodedSignature()}`,
          Authorization:         `Bearer ${signature}`,
          'X-Decentrailized-ID': `did:near:${this.accountId}`,
          'X-Public-Key':        publicKey,
        },
      });

      if (!response.ok) {
        throw new Error('Unable to fetch user info');
      }

      const res = await response.json();
      if (res.status === 'success') {
        return res.data;
      }
      throw new Error('Unable to fetch chat data');
    } catch (err) {
      console.log(err);
      throw new Error('Unable to fetch user info\n', err);
    }
  }

  async loadSocialDB({ receiverId, args }) {
    const actions = [
      functionCall(
        'set',
        args,
        new BN('200000000000000'),
        new BN('0'),
      ),
    ];

    const account = new Account(this.connection, this.accountId);
    const signedDelegate: SignedDelegate = await account.signedDelegate({
      actions,
      blockHeightTtl: 120,
      receiverId,
    });

    console.log('process.env.RESUME_BACKEND_URL', backendUrl);

    const { publicKey, signature } = await creatAuthToken(window.firestoreController.getUserEmail());
    return fetch('http://127.0.0.1:3010/relay', {
      method:  'POST',
      mode:    'cors',
      body:    JSON.stringify(Array.from(encodeSignedDelegate(signedDelegate))),
      headers: {
        'Content-Type':        'application/json',
        // Authorization:         `Bearer ${await this.getEncodedSignature()}`,
        Authorization:         `Bearer ${signature}`,
        'X-Decentrailized-ID': `did:near:${this.accountId}`,
        'X-Public-Key':        publicKey,
      },
    }).catch((err) => {
      console.log('Unable to sign and send delegate action', err);
    });
  }

  async claimSkill(skillId: string): Promise<SkillClaimResponse> {
    try {
      const { publicKey, signature } = await creatAuthToken(window.firestoreController.getUserEmail());
      const response = await fetch(`http://127.0.0.1:3010/users/skills/${skillId}/claim`, {
        method:  'GET',
        mode:    'cors',
        headers: {
          'Content-Type':        'application/json',
          // Authorization:         `Bearer ${await this.getEncodedSignature()}`,
          Authorization:         `Bearer ${signature}`,
          'X-Decentrailized-ID': `did:near:${this.accountId}`,
          'X-Public-Key':        publicKey,
        },
      });

      if (!response.ok) {
        throw new Error('Unable to fetch user info');
      }

      const res = await response.json();
      console.log('response', res);
      if (res.message === 'skill already rewarded') {
        return res;
      }
      return res.data as SkillClaimResponse;
    } catch (err) {
      console.log(err);
      throw new Error('Unable to fetch user info\n', err);
    }
  }

  async getUserInfo(accountId: string): Promise<UserInfo> {
    try {
      const { publicKey, signature } = await creatAuthToken(window.firestoreController.getUserEmail());
      const response = await fetch(`http://127.0.0.1:3010/users/accounts/${accountId}`, {
        method:  'GET',
        mode:    'cors',
        headers: {
          'Content-Type':        'application/json',
          // Authorization:         `Bearer ${await this.getEncodedSignature()}`,
          Authorization:         `Bearer ${signature}`,
          'X-Decentrailized-ID': `did:near:${this.accountId}`,
          'X-Public-Key':        publicKey,
        },
      });

      if (!response.ok) {
        throw new Error('Unable to fetch user info');
      }

      const res: UserInfo = await response.json();
      return res;
    } catch (err) {
      console.log(err);
      throw new Error('Unable to fetch user info\n', err);
    }
  }

  async getUserBalance(accountId: string): Promise<UserBalance> {
    try {
      const { publicKey, signature } = await creatAuthToken(window.firestoreController.getUserEmail());
      const response = await fetch(`http://127.0.0.1:3010/users/accounts/${accountId}/balance`, {
        method:  'GET',
        mode:    'cors',
        headers: {
          'Content-Type':        'application/json',
          // Authorization:         `Bearer ${await this.getEncodedSignature()}`,
          Authorization:         `Bearer ${signature}`,
          'X-Decentrailized-ID': `did:near:${this.accountId}`,
          'X-Public-Key':        publicKey,
        },
      });

      if (!response.ok) {
        throw new Error('Unable to fetch user info');
      }

      const res: UserBalance = await response.json();
      return res;
    } catch (err) {
      console.log(err);
      throw new Error('Unable to fetch user info\n', err);
    }
  }

  async signDelegateAction({ receiverId, actions, signerId }) {
    this.assertValidSigner(signerId);
    let signedDelegate;
    try {
      // webAuthN supported browser
      const account = new Account(this.connection, this.accountId);
      signedDelegate = await account.signedDelegate({
        actions,
        blockHeightTtl: 60,
        receiverId,
      });
      console.log('signedDelegate success');
    } catch {
      console.log('fallback, non webAuthN supported browser');
      // @ts-ignore
      const oidcToken = await firebaseAuth.currentUser.getIdToken();
      const recoveryPK = await this.getUserCredential(oidcToken);
      // make sure to handle failure, (eg token expired) if fail, redirect to failure_url
      signedDelegate = await this.createSignedDelegateWithRecoveryKey({
        oidcToken,
        accountId: this.accountId,
        actions,
        recoveryPK,
      }).catch((err) => {
        console.log(err);
        throw new Error('Unable to sign delegate action');
      });
    }
    return signedDelegate;
  }

  // async signAndSendDelegateAction2({ receiverId, actions }) {
  //   const signedDelegate = await this.signDelegateAction({ receiverId, actions, signerId: this.accountId });
  //   return fetch('http://127.0.0.1:3010/relay', {
  //     method:  'POST',
  //     mode:    'cors',
  //     body:    JSON.stringify(Array.from(encodeSignedDelegate(signedDelegate))),
  //     headers: new Headers({ 'Content-Type': 'application/json' }),
  //   }).catch((err) => {
  //     console.log('Unable to sign and send delegate action', err);
  //   });
  // }

  async signAndSendDelegateAction({ receiverId, actions }) {
    const signedDelegate = await this.signDelegateAction({ receiverId, actions, signerId: this.accountId });
    return fetch(network.relayerUrl, {
      method:  'POST',
      mode:    'cors',
      body:    JSON.stringify(Array.from(encodeSignedDelegate(signedDelegate))),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    }).catch((err) => {
      console.log('Unable to sign and send delegate action', err);
    });
  }

  async signAndSendAddKey({
    contractId, methodNames, allowance, publicKey,
  }) {
    return this.signAndSendDelegateAction({
      receiverId: this.accountId,
      actions:    [
        addKey(PublicKey.from(publicKey), functionCallAccessKey(contractId, methodNames || [], allowance))
      ]
    });
  }

  async signTransaction(params) {
    return this.signDelegateAction(params);
  }

  async getAllAccessKeysExceptRecoveryKey(odicToken: string): Promise<string[]> {
    const account = new Account(this.connection, this.accountId);
    const accessKeys = await account.getAccessKeys();
    const recoveryKey = await this.getUserCredential(odicToken);
    return accessKeys
      .filter((key) => key.public_key !== recoveryKey)
      .map(({ public_key }) => public_key);
  }

  // This call need to be called after new oidc token is generated
  async claimOidcToken(oidcToken: string): Promise<{ mpc_signature: string }> {
    console.log('claimOidcToken', oidcToken);
    let keypair = await this.getKey(`oidc_keypair_${oidcToken}`);

    if (!keypair) {
      console.log('No keypair found in keyStore, trying to get from localStore');
      keypair = KeyPair.fromRandom('ED25519');
      await this.keyStore.setKey(this.networkId, `oidc_keypair_${oidcToken}`, keypair);
      // Delete old oidc keypair
      deleteOidcKeyPairOnLocalStorage();
      await this.localStore.setKey(this.networkId, `oidc_keypair_${oidcToken}`, keypair);
    }

    const signature = getUserCredentialsFrpSignature({
      salt:            CLAIM + 0,
      oidcToken,
      shouldHashToken: true,
      keypair,
    });

    const data = {
      oidc_token_hash: sha256(oidcToken),
      frp_signature:   signature,
      frp_public_key:  keypair.getPublicKey().toString(),
    };

    // https://github.com/near/mpc-recovery#claim-oidc-id-token-ownership
    try {
      const response = await fetch(`${network.fastAuth.mpcRecoveryUrl}/claim_oidc`, {
        method:  'POST',
        mode:    'cors' as const,
        body:    JSON.stringify(data),
        headers: new Headers({ 'Content-Type': 'application/json' }),
      });

      if (!response.ok) {
        throw new Error('Unable to claim OIDC token');
      }

      const res: {
        type: string,
        mpc_signature: string;
      } = await response.json();

      if (!verifyMpcSignature(res.mpc_signature, signature)) {
        throw new Error('MPC Signature is not valid');
      }

      return res;
    } catch (err) {
      console.log(err);
      throw new Error('Unable to claim OIDC token');
    }
  }

  async getUserCredential(oidcToken) {
    // @ts-ignore
    const GET_USER_SALT = CLAIM + 2;
    const keypair = await this.getKey(`oidc_keypair_${oidcToken}`) || await this.getLocalStoreKey(`oidc_keypair_${oidcToken}`);

    if (!keypair) {
      throw new Error('Unable to get oidc keypair');
    }

    const signature = getUserCredentialsFrpSignature({
      salt:            GET_USER_SALT,
      oidcToken,
      shouldHashToken: false,
      keypair,
    });

    const data = {
      oidc_token:     oidcToken,
      frp_signature:  signature,
      frp_public_key: keypair.getPublicKey().toString(),
    };

    // https://github.com/near/mpc-recovery#user-credentials
    return fetch(`${network.fastAuth.mpcRecoveryUrl}/user_credentials`, {
      method:  'POST',
      mode:    'cors' as const,
      body:    JSON.stringify(data),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    }).then(async (response) => {
      if (!response.ok) {
        throw new Error('Unable to get user credential');
      }
      const res = await response.json();
      return res.recovery_pk;
    }).catch((err) => {
      console.log(err);
      throw new Error('Unable to get user credential');
    });
  }

  async getBlock() {
    return this.connection.provider.block({ finality: 'final' });
  }

  async createSignedDelegateWithRecoveryKey({
    oidcToken,
    accountId,
    recoveryPK,
    actions,
  }) {
    const GET_SIGNATURE_SALT = CLAIM + 3;
    const GET_USER_SALT = CLAIM + 2;
    const localKey = await this.getKey(`oidc_keypair_${oidcToken}`) || await this.getLocalStoreKey(`oidc_keypair_${oidcToken}`);

    const { header } = await this.getBlock();
    const delegateAction = buildDelegateAction({
      actions,
      maxBlockHeight: new BN(header.height).add(new BN(60)),
      nonce:          await this.fetchNonce({ accountId, publicKey: recoveryPK }),
      publicKey:      PublicKey.from(recoveryPK),
      receiverId:     accountId,
      senderId:       accountId,
    });
    const encodedDelegateAction = Buffer.from(serialize(SCHEMA, delegateAction)).toString('base64');
    const userCredentialsFrpSignature = getUserCredentialsFrpSignature({
      salt:            GET_USER_SALT,
      oidcToken,
      shouldHashToken: false,
      keypair:         localKey,
    });
    const signRequestFrpSignature = getSignRequestFrpSignature({
      salt:    GET_SIGNATURE_SALT,
      oidcToken,
      keypair: localKey,
      delegateAction,
    });

    const payload = {
      delegate_action:                encodedDelegateAction,
      oidc_token:                     oidcToken,
      frp_signature:                  signRequestFrpSignature,
      user_credentials_frp_signature: userCredentialsFrpSignature,
      frp_public_key:                 localKey.getPublicKey().toString(),
    };

    // https://github.com/near/mpc-recovery#sign
    return fetch(`${network.fastAuth.mpcRecoveryUrl}/sign`, {
      method:  'POST',
      mode:    'cors' as const,
      body:    JSON.stringify(payload),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    }).then(async (response) => {
      if (!response.ok) {
        throw new Error('Unable to get signature');
      }
      const res = await response.json();
      return res.signature;
    }).then((signature) => {
      const signatureObj = new Signature({
        keyType: KeyType.ED25519,
        data:    Buffer.from(signature, 'hex'),
      });
      return new SignedDelegate({
        delegateAction,
        signature: signatureObj,
      });
    });
  }

  async signAndSendActionsWithRecoveryKey({
    oidcToken,
    accountId,
    recoveryPK,
    actions,
  }) {
    const signedDelegate = await this.createSignedDelegateWithRecoveryKey({
      oidcToken,
      accountId,
      recoveryPK,
      actions,
    }).catch((err) => {
      console.log(err);
      throw new Error('Unable to sign delegate action');
    });
    const encodedSignedDelegate = encodeSignedDelegate(signedDelegate);
    return fetch(network.relayerUrl, {
      method:  'POST',
      mode:    'cors',
      body:    JSON.stringify(Array.from(encodedSignedDelegate)),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    }).catch((err) => {
      console.log('Unable to sign and send action with recovery key', err);
    });
  }

  /**
   * Recovers the account ID and the recovery public key using an OIDC token.
   *
   * @param oidcToken - The OIDC token used for account recovery.
   * @returns A promise that resolves to an object containing the account ID and recovery public key, or undefined if no account IDs are found.
   */
  async recoverAccountWithOIDCToken(oidcToken: string): Promise<undefined | {
    accountId: string;
    recoveryPK: string;
  }> {
    try {
      const recoveryPK = await this.getUserCredential(oidcToken);
      const accountIds = await fetchAccountIds(recoveryPK);

      if (accountIds.length > 0) {
        return {
          accountId: accountIds[0],
          recoveryPK
        };
      }

      return undefined;
    } catch {
      return undefined;
    }
  }

  getConnection() {
    return this.connection;
  }
}

export default FastAuthController;
