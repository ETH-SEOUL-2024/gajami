import { configuration } from '../config/configuration';
import { MpcContract } from '../contracts/mpcContract';
import { FeeMarketEIP1559Transaction } from "@ethereumjs/tx";
import { bytesToHex } from "@ethereumjs/util";
import { Ethereum } from '../chains/ethereum';
import {
  Address,
  parseEther,
  Hex,
  Hash,
} from "viem";
import {
  EthTransferPayload,
  TxPayload,
} from "../libs/types";
import BN from "bn.js";
import { queryGasPrice } from "../utils/gasPrice";
import { Account } from 'near-api-js';

export class NearEthAdapter {
  private sender: Address;
  private nearMpcContract: MpcContract;
  private ethereum: Ethereum;

  private constructor(sender: Address, nearMpcContract: MpcContract, ethereum: Ethereum) {
    this.sender = sender;
    this.nearMpcContract = nearMpcContract;
    this.ethereum = ethereum;
  }

  static async from(adminNearAccount: Account): Promise<NearEthAdapter> {
    const derivationPath = "ethereum,1";
    const nearMpcContract: MpcContract = MpcContract.from(adminNearAccount);
    const sender: Address = await nearMpcContract.deriveEthAddress(derivationPath);
    const ethereum: Ethereum = Ethereum.from({
      providerUrl: configuration()['ETH_RPC_URL'],
      explorerUrl: configuration()['ETH_EXPLORER_URL'],
      gasStationUrl: configuration()['ETH_GAS_QUERY_URL'],
      derivationPath: derivationPath,
    });

    return new NearEthAdapter(sender, nearMpcContract, ethereum);
  }

  async getEthBalance(): Promise<BN> {
    return this.ethereum.client.getBalance({ address: this.sender });
  }

  /**
   * Takes a minimally declared Ethereum Transaction,
   * builds the full transaction payload (with gas estimates, prices etc...),
   * acquires signature from Near MPC Contract and submits transaction to public mempool.
   *
   * @param {EthTransferPayload} txData - Minimal transaction data to be signed by Near MPC and executed on EVM.
   */
  async signAndSendTransaction(txData: EthTransferPayload, nearGas?: BN): Promise<Hash> {
    console.log("Creating Payload for sender:", this.sender);
    const { transaction, payload } = await this.createTxPayload(txData);
    const { big_r, big_s } = await this.nearMpcContract.requestSignature(
      payload,
      this.ethereum.derivationPath,
      nearGas
    );

    const signedTx = this.reconstructSignature(transaction, big_r, big_s);
    console.log("Relaying signed tx to EVM...");
    return this.relayTransaction(signedTx);
  }

  /**
   * Builds a complete, unsigned transaction (with nonce, gas estimates, current prices)
   * and payload bytes in preparation to be relayed to Near MPC contract.
   *
   * @param {EthTransferPayload} tx - Minimal transaction data to be signed by Near MPC and executed on EVM.
   * @returns transacion and its bytes (the payload to be signed on Near)
   */
  private async createTxPayload(tx: EthTransferPayload): Promise<TxPayload> {
    const transaction = await this.buildEthTransaction(tx);
    console.log("Built Transaction", JSON.stringify(transaction));
    const payload = Array.from(
      new Uint8Array(transaction.getHashedMessageToSign().slice().reverse())
    );
    return { transaction, payload };
  }

  private reconstructSignature = (
    transaction: FeeMarketEIP1559Transaction,
    big_r: string,
    big_s: string
  ): FeeMarketEIP1559Transaction => {
    const r = Buffer.from(big_r.substring(2), "hex");
    const s = Buffer.from(big_s, "hex");

    const candidates = [0n, 1n].map((v) => transaction.addSignature(v, r, s));
    const signature = candidates.find(
      (c) =>
        c.getSenderAddress().toString().toLowerCase() ===
        this.sender.toLowerCase()
    );

    if (!signature) {
      throw new Error("Signature is not valid");
    }

    return signature;
  };

  /**
   * Relays signed transaction to Etherem mempool for execution.
   * @param signedTx - Signed Ethereum transaction.
   * @returns Transaction Hash of relayed transaction.
   */
  private async relayTransaction(signedTx: FeeMarketEIP1559Transaction): Promise<Hash> {
    const serializedTx = bytesToHex(signedTx.serialize()) as Hex;
    const txHash = await this.ethereum.client.sendRawTransaction({
      serializedTransaction: serializedTx,
    });
    console.log(`Transaction Confirmed: ${this.ethereum.explorerUrl}/tx/${txHash}`);
    return txHash;
  }



  private async buildEthTransaction(
    tx: EthTransferPayload
  ): Promise<FeeMarketEIP1559Transaction> {
    const nonce = await this.ethereum.client.getTransactionCount({
      address: this.sender,
    });
    const { maxFeePerGas, maxPriorityFeePerGas } = await queryGasPrice(
      this.ethereum.gasStationUrl
    );
    const transactionData = {
      nonce,
      account: this.sender,
      to: tx.receiver,
      value: parseEther(tx.amount.toString()),
      data: tx.data || "0x",
    };
    const estimatedGas = await this.ethereum.client.estimateGas(transactionData);
    const transactionDataWithGasLimit = {
      ...transactionData,
      gasLimit: BigInt(estimatedGas.toString()),
      maxFeePerGas,
      maxPriorityFeePerGas,
      chainId: await this.ethereum.client.getChainId(),
    };
    console.log("TxData:", transactionDataWithGasLimit);
    return FeeMarketEIP1559Transaction.fromTxData(transactionDataWithGasLimit);
  }
}