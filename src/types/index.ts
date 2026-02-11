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
  confirmingBlocks: number;
  timestamp: number;
}

export interface SompiNonce {
  nonce: string;
  address: string;
  createdAt: number;
  expiresAt: number;
  used: boolean;
}

export interface PaymentRequest {
  encoded: string;
  qrCode: string;
  nonce: string;
  expiresAt: number;
  data: any;
}

export interface GameState {
  gameId: string;
  gameType: string;
  players: string[];
  state: {
    moves: GameMove[];
    scores: Record<string, number>;
    ended?: boolean;
  };
  lastUpdate: number;
  blockHash: string;
  blueScore: number;
}

export interface GameMove {
  gameId: string;
  playerId: string;
  move: any;
  timestamp: number;
  txId: string;
  confirmed: boolean;
}

export interface Leaderboard {
  gameType: string;
  entries: LeaderboardEntry[];
  lastUpdate: number;
}

export interface LeaderboardEntry {
  playerId: string;
  score: number;
  wins: number;
  games: number;
}

export interface IoTDataAnchor {
  deviceId: string;
  dataHash: string;
  data: any;
  timestamp: number;
  txId: string;
  covenantLocked: boolean;
  covenantConditions?: CovenantConditions;
  verified: boolean;
}

export interface CovenantConditions {
  maxTemperature?: number;
  minTemperature?: number;
  maxHumidity?: number;
  allowedLocations?: string[];
  timeWindow?: {
    start: number;
    end: number;
  };
}
