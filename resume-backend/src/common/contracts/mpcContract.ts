import { configuration } from '../config/configuration';
import { Contract, Account } from "near-api-js";
import { Address } from "viem";
import {
  deriveChildPublicKey,
  najPublicKeyStrToUncompressedHexPoint,
  uncompressedHexPointToEvmAddress,
} from "../utils/kdf";
import { NO_DEPOSIT, TGAS } from "../chains/near";
import BN from "bn.js";

interface ChangeMethodArgs<T> {
  args: T;
  gas: BN;
  attachedDeposit: BN;
}

interface SignRequest {
  path: string;
  payload: number[];
  key_version: number;
}

interface SignResponse {
  big_r: string;
  big_s: string;
}

interface MpcContractInterface extends Contract {
  // Define the signature for the `public_key` view method
  public_key: () => Promise<string>;

  // Define the signature for the `sign` change method
  sign: (args: ChangeMethodArgs<SignRequest>) => Promise<[string, string]>;
}

export class MpcContract {
  contract: MpcContractInterface;

  constructor(account: Account, contractId: string) {
    this.contract = new Contract(account, contractId, {
      changeMethods: ["sign"],
      viewMethods: ["public_key"],
      useLocalViewExecution: false,
    }) as MpcContractInterface;
  }

  static from(account: Account): MpcContract {
    return new MpcContract(
      account,
      configuration()['NEAR_MPC_CONTRACT'],
    );
  }

  deriveEthAddress = async (derivationPath: string): Promise<Address> => {
    const rootPublicKey = await this.contract.public_key();

    const publicKey = await deriveChildPublicKey(
      najPublicKeyStrToUncompressedHexPoint(rootPublicKey),
      this.contract.account.accountId,
      derivationPath
    );

    return uncompressedHexPointToEvmAddress(publicKey);
  };

  requestSignature = async (
    payload: number[],
    path: string,
    gas?: BN
  ): Promise<SignResponse> => {
    const [big_r, big_s] = await this.contract.sign({
      args: { path, payload, key_version: 0 },
      gas: gas || TGAS.muln(200), // Default of 200 TGAS
      attachedDeposit: new BN(NO_DEPOSIT),
    });
    return { big_r, big_s };
  };

}
