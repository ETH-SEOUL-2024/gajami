import {
  createPublicClient,
  http,
} from "viem";
import { sepolia } from "viem/chains";
import { EthereumParams } from '../libs/types';

export class Ethereum {
  client: any;
  explorerUrl: string;
  gasStationUrl: string;
  derivationPath: string;

  private constructor(config: {
    providerUrl: string;
    explorerUrl: string;
    gasStationUrl: string;
    derivationPath: string;
  }) {
    // todo: match chain setting to configuration()['ETH_CHAIN_NAME']
    this.client = createPublicClient({
      chain: sepolia, transport: http(config.providerUrl)
    });
    this.explorerUrl = config.explorerUrl;
    this.gasStationUrl = config.gasStationUrl;
    this.derivationPath = config.derivationPath;
  }

  /**
  * Constructs an EVM instance with the provided configuration.
  * @param {EthereumParams} args - The configuration object for the Adapter instance.
  */
  static from(args: EthereumParams): Ethereum {
    return new Ethereum({
      ...args
    });
  }
}
