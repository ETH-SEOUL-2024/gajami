import { NearConfig } from '@near-js/wallet-account';
import { configuration } from '../config/configuration';
import BN from "bn.js";
import { keyStores, KeyPair, Account, Connection } from "near-api-js";
import { KeyStore } from '@near-js/keystores';

export const TGAS = new BN(1000000000000);
export const NO_DEPOSIT = "0";


const getConfig = (name) => {
  return configuration()[name];
};

const defaultConnectionConfig: NearConfig = {
  networkId: getConfig('NEAR_NETWORK_ID'),
  nodeUrl: getConfig('NEAR_RPC_URL'),
};


/**
 * Loads Near Account from process.env.
 * @param network {NearConfig} network settings
 * @returns {Account}
 */
export const getAdminNearAccount = async (): Promise<NearAccount> => {
  return getNearAccountWithKeyPair(
    KeyPair.fromString(getConfig('NEAR_ACCOUNT_PRIVATE_KEY')),
    getConfig('NEAR_ACCOUNT_ID'),
  );
};

export const getNearAccount = async (accountId: string): Promise<Account> => {
  return NearAccount.from({ accountId });
};

export class NearAccount extends Account {
  public keyPair: KeyPair;
  constructor(accountId: string, keyStore: KeyStore) {
    super(Connection.fromConfig({
      networkId: getConfig('NEAR_NETWORK_ID'),
      provider: { type: 'JsonRpcProvider', args: { url: getConfig('NEAR_RPC_URL') } },
      signer: { type: 'InMemorySigner', keyStore: keyStore },
    }), accountId);
    this.keyPair = KeyPair.fromString(getConfig('NEAR_ACCOUNT_PRIVATE_KEY'));
  }

  static from(args: { accountId: string, keyStore?: KeyStore }): NearAccount {
    return new NearAccount(args.accountId, args.keyStore || new keyStores.InMemoryKeyStore());
  }
}


/**
 * Loads Near Account from provided keyPair and accountId
 * Defaults to TESTNET_CONFIG
 * @param keyPair {KeyPair}
 * @param accountId {string}
 * @param network {NearConfig} network settings
 * @returns {Account}
 */
const getNearAccountWithKeyPair = async (
  keyPair: KeyPair,
  accountId: string,
): Promise<NearAccount> => {
  const keyStore = new keyStores.InMemoryKeyStore();
  await keyStore.setKey(defaultConnectionConfig.networkId, accountId, keyPair);

  return NearAccount.from({ accountId, keyStore });
};