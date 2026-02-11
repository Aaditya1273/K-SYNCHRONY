import { KSynchronyConfig } from './types';
import { PaymentEngine } from './payments/PaymentEngine';
import { GamingEngine } from './gaming/GamingEngine';
import { IoTEngine } from './iot/IoTEngine';
import { KaspaClient } from './core/KaspaClient';

export class KSynchrony {
  public payments: PaymentEngine;
  public gaming: GamingEngine;
  public iot: IoTEngine;
  
  private config: KSynchronyConfig;
  private client: KaspaClient;

  constructor(config: KSynchronyConfig) {
    this.config = {
      ...config,
      apiEndpoint: config.apiEndpoint || this.getDefaultEndpoint(config.network)
    };

    this.client = new KaspaClient({
      endpoint: this.config.apiEndpoint!,
      network: this.config.network
    });

    this.payments = new PaymentEngine(this.config, this.client);
    this.gaming = new GamingEngine(this.config, this.client);
    this.iot = new IoTEngine(this.config, this.client);
  }

  async initialize(): Promise<void> {
    console.log('🚀 Initializing K-SYNCHRONY...');
    console.log(`Network: ${this.config.network}`);
    console.log(`Endpoint: ${this.config.apiEndpoint}`);

    await Promise.all([
      this.payments.initialize(),
      this.gaming.initialize(),
      this.iot.initialize()
    ]);

    console.log('✓ K-SYNCHRONY initialized successfully');
  }

  getConfig(): KSynchronyConfig {
    return { ...this.config };
  }

  getClient(): KaspaClient {
    return this.client;
  }

  private getDefaultEndpoint(network: 'mainnet' | 'testnet'): string {
    return network === 'testnet' 
      ? 'testnet.kaspathon.com'
      : 'mainnet.kaspathon.com';
  }

  shutdown(): void {
    console.log('Shutting down K-SYNCHRONY...');
    this.payments.shutdown();
    this.gaming.shutdown();
    this.iot.shutdown();
    this.client.disconnect();
    console.log('✓ K-SYNCHRONY shutdown complete');
  }
}

