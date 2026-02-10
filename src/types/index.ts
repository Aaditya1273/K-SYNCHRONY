export interface KSynchronyConfig {
  network: 'mainnet' | 'testnet';
  apiEndpoint?: string;
  apiKey?: string;
}

export interface ProbabilityResult {
  txId: string;
  probability: number;
  estimatedConfirmationTime: number;
  dagDepth: number;
  timestamp: number;
}

export interface SompiNonce {
  nonce: string;
  address: string;
  expiresAt: number;
}

export interface GameState {
  gameId: string;
  players: string[];
  state: any;
  lastUpdate: number;
  blockHash: string;
}

export interface IoTDataAnchor {
  deviceId: string;
  dataHash: string;
  timestamp: number;
  txId: string;
  covenantLocked: boolean;
}
