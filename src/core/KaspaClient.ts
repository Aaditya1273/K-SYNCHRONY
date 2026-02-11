import axios, { AxiosInstance } from 'axios';
import WebSocket from 'ws';

export interface KaspaRPCConfig {
  endpoint: string;
  network: 'mainnet' | 'testnet';
}

export interface BlockInfo {
  hash: string;
  timestamp: number;
  blueScore: number;
  parentHashes: string[];
}

export interface TransactionInfo {
  txId: string;
  blockHash?: string;
  acceptingBlockHash?: string;
  acceptingBlockBlueScore?: number;
  inputs: any[];
  outputs: any[];
}

export class KaspaClient {
  private httpClient: AxiosInstance;
  private wsClient: WebSocket | null = null;
  private config: KaspaRPCConfig;
  private requestId = 0;

  constructor(config: KaspaRPCConfig) {
    this.config = config;
    this.httpClient = axios.create({
      baseURL: `https://${config.endpoint}`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async connect(): Promise<void> {
    // Test connection
    try {
      await this.getBlockDagInfo();
      console.log(`✓ Connected to Kaspa ${this.config.network}`);
    } catch (error) {
      console.error('Failed to connect to Kaspa network:', error);
      throw error;
    }
  }

  async rpcCall(method: string, params: any = {}): Promise<any> {
    try {
      const response = await this.httpClient.post('', {
        jsonrpc: '2.0',
        id: ++this.requestId,
        method,
        params
      });

      if (response.data.error) {
        throw new Error(response.data.error.message);
      }

      return response.data.result;
    } catch (error: any) {
      throw new Error(`RPC call failed: ${error.message}`);
    }
  }

  async getBlockDagInfo(): Promise<any> {
    return this.rpcCall('getBlockDagInfoRequest');
  }

  async getBlock(blockHash: string): Promise<BlockInfo> {
    const result = await this.rpcCall('getBlockRequest', { hash: blockHash });
    return {
      hash: result.hash,
      timestamp: result.header.timestamp,
      blueScore: result.header.blueScore,
      parentHashes: result.header.parents || []
    };
  }

  async getTransaction(txId: string): Promise<TransactionInfo> {
    const result = await this.rpcCall('getTransactionRequest', { txId });
    return {
      txId: result.transaction.verboseData.transactionId,
      blockHash: result.transaction.verboseData.blockHash,
      acceptingBlockHash: result.acceptingBlockHash,
      acceptingBlockBlueScore: result.acceptingBlockBlueScore,
      inputs: result.transaction.inputs,
      outputs: result.transaction.outputs
    };
  }

  async submitTransaction(transaction: any): Promise<string> {
    const result = await this.rpcCall('submitTransactionRequest', { transaction });
    return result.transactionId;
  }

  async getBalance(address: string): Promise<number> {
    const result = await this.rpcCall('getBalanceByAddressRequest', { address });
    return result.balance || 0;
  }

  async getUtxosByAddresses(addresses: string[]): Promise<any[]> {
    const result = await this.rpcCall('getUtxosByAddressesRequest', { addresses });
    return result.entries || [];
  }

  async getVirtualSelectedParentBlueScore(): Promise<number> {
    const info = await this.getBlockDagInfo();
    return info.virtualParentHashes?.length || 0;
  }

  disconnect(): void {
    if (this.wsClient) {
      this.wsClient.close();
      this.wsClient = null;
    }
  }
}
