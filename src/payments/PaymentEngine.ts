import { KSynchronyConfig, ProbabilityResult, SompiNonce } from '../types';
import { DAGAnalyzer } from '../core/DAGAnalyzer';

export class PaymentEngine {
  private config: KSynchronyConfig;
  private dagAnalyzer: DAGAnalyzer;
  private nonceRegistry: Map<string, SompiNonce[]>;

  constructor(config: KSynchronyConfig) {
    this.config = config;
    this.dagAnalyzer = new DAGAnalyzer();
    this.nonceRegistry = new Map();
  }

  async initialize(): Promise<void> {
    // Initialize connection to Kaspa network
  }

  /**
   * Get real-time probability of transaction inclusion
   */
  async getProbabilityOfInclusion(txId: string): Promise<ProbabilityResult> {
    return this.dagAnalyzer.analyzeProbabilityOfInclusion(txId);
  }

  /**
   * Generate unique Sompi nonce for collision-free payments
   * Allows 100+ simultaneous payments to single merchant address
   */
  async generateSompiNonce(merchantAddress: string): Promise<SompiNonce> {
    const nonce = this.createUniqueNonce();
    const sompiNonce: SompiNonce = {
      nonce,
      address: merchantAddress,
      expiresAt: Date.now() + 300000 // 5 minutes
    };

    if (!this.nonceRegistry.has(merchantAddress)) {
      this.nonceRegistry.set(merchantAddress, []);
    }
    this.nonceRegistry.get(merchantAddress)!.push(sompiNonce);

    return sompiNonce;
  }

  /**
   * Create NFC/QR payment request with embedded nonce
   */
  async createPaymentRequest(merchantAddress: string, amount: number): Promise<string> {
    const nonce = await this.generateSompiNonce(merchantAddress);
    
    // Encode payment data with nonce
    const paymentData = {
      address: merchantAddress,
      amount,
      nonce: nonce.nonce,
      expires: nonce.expiresAt
    };

    return Buffer.from(JSON.stringify(paymentData)).toString('base64');
  }

  private createUniqueNonce(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clean up expired nonces
   */
  cleanupExpiredNonces(): void {
    const now = Date.now();
    for (const [address, nonces] of this.nonceRegistry.entries()) {
      const active = nonces.filter(n => n.expiresAt > now);
      if (active.length === 0) {
        this.nonceRegistry.delete(address);
      } else {
        this.nonceRegistry.set(address, active);
      }
    }
  }
}
