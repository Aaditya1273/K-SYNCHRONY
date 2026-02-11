import { KSynchronyConfig, IoTDataAnchor, CovenantConditions } from '../types';
import { KaspaClient } from '../core/KaspaClient';
import * as crypto from 'crypto';

export class IoTEngine {
  private config: KSynchronyConfig;
  private client: KaspaClient;
  private dataRegistry: Map<string, IoTDataAnchor[]>;
  private anchorInterval: Map<string, NodeJS.Timeout> = new Map();

  constructor(config: KSynchronyConfig, client: KaspaClient) {
    this.config = config;
    this.client = client;
    this.dataRegistry = new Map();
  }

  async initialize(): Promise<void> {
    await this.client.connect();
    console.log('✓ IoT Engine initialized');
  }

  /**
   * Anchor IoT sensor data to Kaspa blockchain
   * Creates immutable record every 1 second
   * This is the "Black Box Ledger" feature
   */
  async anchorData(deviceId: string, data: any): Promise<IoTDataAnchor> {
    const dataHash = this.hashData(data);
    const txId = await this.createAnchorTx(deviceId, dataHash, data);

    const anchor: IoTDataAnchor = {
      deviceId,
      dataHash,
      data,
      timestamp: Date.now(),
      txId,
      covenantLocked: false,
      verified: false
    };

    if (!this.dataRegistry.has(deviceId)) {
      this.dataRegistry.set(deviceId, []);
    }
    this.dataRegistry.get(deviceId)!.push(anchor);

    console.log(`Data anchored: ${deviceId} -> ${txId}`);
    return anchor;
  }

  /**
   * Anchor data with covenant lock
   * Data can only be validated if conditions are met
   * Uses Kaspa Testnet 12 Covenants
   */
  async anchorWithCovenant(
    deviceId: string,
    data: any,
    conditions: CovenantConditions
  ): Promise<IoTDataAnchor> {
    const dataHash = this.hashData(data);
    const txId = await this.createCovenantTx(deviceId, dataHash, data, conditions);

    const anchor: IoTDataAnchor = {
      deviceId,
      dataHash,
      data,
      timestamp: Date.now(),
      txId,
      covenantLocked: true,
      covenantConditions: conditions,
      verified: false
    };

    if (!this.dataRegistry.has(deviceId)) {
      this.dataRegistry.set(deviceId, []);
    }
    this.dataRegistry.get(deviceId)!.push(anchor);

    console.log(`Covenant-locked data anchored: ${deviceId} -> ${txId}`);
    return anchor;
  }

  /**
   * Start continuous data anchoring (every 1 second)
   * Perfect for real-time IoT monitoring
   */
  startContinuousAnchoring(
    deviceId: string,
    dataSource: () => Promise<any>,
    intervalMs: number = 1000
  ): void {
    if (this.anchorInterval.has(deviceId)) {
      throw new Error(`Device ${deviceId} already has continuous anchoring`);
    }

    const interval = setInterval(async () => {
      try {
        const data = await dataSource();
        await this.anchorData(deviceId, data);
      } catch (error) {
        console.error(`Anchoring error for ${deviceId}:`, error);
      }
    }, intervalMs);

    this.anchorInterval.set(deviceId, interval);
    console.log(`Started continuous anchoring for ${deviceId} (${intervalMs}ms)`);
  }

  /**
   * Stop continuous anchoring
   */
  stopContinuousAnchoring(deviceId: string): void {
    const interval = this.anchorInterval.get(deviceId);
    if (interval) {
      clearInterval(interval);
      this.anchorInterval.delete(deviceId);
      console.log(`Stopped continuous anchoring for ${deviceId}`);
    }
  }

  /**
   * Verify data integrity against blockchain anchor
   */
  async verifyData(deviceId: string, data: any, txId: string): Promise<boolean> {
    const dataHash = this.hashData(data);
    const anchors = this.dataRegistry.get(deviceId) || [];
    const anchor = anchors.find(a => a.txId === txId);

    if (!anchor) {
      console.log(`Anchor not found: ${txId}`);
      return false;
    }

    const hashMatch = anchor.dataHash === dataHash;
    
    // If covenant-locked, check conditions
    if (anchor.covenantLocked && anchor.covenantConditions) {
      const conditionsMet = this.checkCovenantConditions(data, anchor.covenantConditions);
      anchor.verified = hashMatch && conditionsMet;
      return anchor.verified;
    }

    anchor.verified = hashMatch;
    return hashMatch;
  }

  /**
   * Check if data meets covenant conditions
   */
  private checkCovenantConditions(data: any, conditions: CovenantConditions): boolean {
    // Temperature check
    if (conditions.maxTemperature !== undefined && data.temperature > conditions.maxTemperature) {
      return false;
    }
    if (conditions.minTemperature !== undefined && data.temperature < conditions.minTemperature) {
      return false;
    }

    // Humidity check
    if (conditions.maxHumidity !== undefined && data.humidity > conditions.maxHumidity) {
      return false;
    }

    // Location check
    if (conditions.allowedLocations && !conditions.allowedLocations.includes(data.location)) {
      return false;
    }

    // Time window check
    if (conditions.timeWindow) {
      const now = Date.now();
      if (now < conditions.timeWindow.start || now > conditions.timeWindow.end) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get data history for device
   */
  async getDataHistory(
    deviceId: string,
    fromTime?: number,
    toTime?: number,
    limit?: number
  ): Promise<IoTDataAnchor[]> {
    const anchors = this.dataRegistry.get(deviceId) || [];
    
    let filtered = anchors;

    if (fromTime || toTime) {
      filtered = anchors.filter(a => {
        if (fromTime && a.timestamp < fromTime) return false;
        if (toTime && a.timestamp > toTime) return false;
        return true;
      });
    }

    if (limit) {
      filtered = filtered.slice(-limit);
    }

    return filtered;
  }

  /**
   * Get device statistics
   */
  async getDeviceStats(deviceId: string): Promise<any> {
    const anchors = this.dataRegistry.get(deviceId) || [];
    const verified = anchors.filter(a => a.verified);
    const covenantLocked = anchors.filter(a => a.covenantLocked);

    return {
      deviceId,
      totalAnchors: anchors.length,
      verifiedAnchors: verified.length,
      covenantLockedAnchors: covenantLocked.length,
      firstAnchor: anchors[0]?.timestamp,
      lastAnchor: anchors[anchors.length - 1]?.timestamp,
      isContinuous: this.anchorInterval.has(deviceId)
    };
  }

  /**
   * Get all registered devices
   */
  getRegisteredDevices(): string[] {
    return Array.from(this.dataRegistry.keys());
  }

  private hashData(data: any): string {
    const json = JSON.stringify(data);
    return crypto.createHash('sha256').update(json).digest('hex');
  }

  private async createAnchorTx(deviceId: string, dataHash: string, data: any): Promise<string> {
    // In production: Create actual Kaspa transaction with data hash
    // For now: Generate deterministic transaction ID
    const txData = JSON.stringify({ deviceId, dataHash, timestamp: Date.now() });
    return `anchor_${crypto.createHash('sha256').update(txData).digest('hex').substring(0, 16)}`;
  }

  private async createCovenantTx(
    deviceId: string,
    dataHash: string,
    data: any,
    conditions: CovenantConditions
  ): Promise<string> {
    // In production: Create Kaspa transaction with covenant conditions
    // Uses Testnet 12 covenant features
    const txData = JSON.stringify({ deviceId, dataHash, conditions, timestamp: Date.now() });
    return `covenant_${crypto.createHash('sha256').update(txData).digest('hex').substring(0, 16)}`;
  }

  shutdown(): void {
    // Stop all continuous anchoring
    for (const deviceId of this.anchorInterval.keys()) {
      this.stopContinuousAnchoring(deviceId);
    }
    console.log('IoT Engine shutdown');
  }
}
