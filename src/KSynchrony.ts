import { KSynchronyConfig } from './types';
import { PaymentEngine } from './payments/PaymentEngine';
import { GamingEngine } from './gaming/GamingEngine';
import { IoTEngine } from './iot/IoTEngine';

export class KSynchrony {
  public payments: PaymentEngine;
  public gaming: GamingEngine;
  public iot: IoTEngine;
  
  private config: KSynchronyConfig;

  constructor(config: KSynchronyConfig) {
    this.config = config;
    this.payments = new PaymentEngine(config);
    this.gaming = new GamingEngine(config);
    this.iot = new IoTEngine(config);
  }

  async initialize(): Promise<void> {
    await Promise.all([
      this.payments.initialize(),
      this.gaming.initialize(),
      this.iot.initialize()
    ]);
  }

  getConfig(): KSynchronyConfig {
    return { ...this.config };
  }
}
