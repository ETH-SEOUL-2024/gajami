import { FeeMarketEIP1559Transaction } from "@ethereumjs/tx";
import { Address, Hex } from "viem";

export interface EthTransferPayload {
  /// Recipient of the transaction
  receiver: Address;
  /// ETH value of transaction
  amount: number;
  /// Call Data of the transaction
  data?: Hex;
}

export interface EthereumParams {
  /// The URL of the Ethereum JSON RPC provider.
  providerUrl: string;
  /// The base URL of the blockchain explorer.
  explorerUrl: string;
  /// The base URL of the blockchain gas station.
  gasStationUrl: string;

  derivationPath: string;
}


export interface GasPrices {
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
}

export interface TxPayload {
  transaction: FeeMarketEIP1559Transaction;
  payload: number[];
}

export type SkillGrade = 'A' | 'B' | 'C' | 'D';
export type SkillData = { [skill: string]: SkillGrade };
