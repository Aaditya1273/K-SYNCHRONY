import { KSynchronyConfig, ProbabilityResult, SompiNonce, PaymentRequest } from '../types';
import { DAGAnalyzer } from '../core/DAGAnalyzer';
import { KaspaClient } from '../core/KaspaClient';
import QRCode from 'qrcode';
import * as crypto from 'crypto';

export class PaymentEngine {
  private config: KSynchronyConfig;
  private dagAnalyzer: DAGAnalyzer;
  private client: KaspaClient;
  private nonceRegistry: Map<string, SompiNonce[]>;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config: KSynchronyConfig, client: KaspaClient) {
    this.config = config;
    this.client = client;
    this.dagAnalyzer = new DAGAnalyzer(client);
    this.nonceRegistry = new Map();
  }

  async initialize(): Promise<void> {
    await this.client.connect();
    
    // Start automatic nonce cleanup every 60 seconds
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredNonces();
    }, 60000);

    console.log('✓ Payment Engine initialized');
  }

  /**
   * Get real-time probability of transaction inclusion
   * This is the core "Predictive Settlement" feature
   */
  async getProbabilityOfInclusion(txId: string): Promise<ProbabilityResult> {
    return this.dagAnalyzer.analyzeProbabilityOfInclusion(txId);
  }

  /**
   * Monitor transaction in real-time until high confidence
   */
  async *monitorPayment(txId: string): AsyncGenerator<ProbabilityResult> {
    yield* this.dagAnalyzer.monitorTransaction(txId, 1000);
  }

  /**
   * Generate unique Sompi nonce for collision-free payments
   * Allows 100+ simultaneous payments to single merchant address
   * 
   * This is the killer feature that solves UTXO collision problem
   */
  async generateSompiNonce(merchantAddress: string): Promise<SompiNonce> {
    const nonce = this.createUniqueNonce();
    const sompiNonce: SompiNonce = {
      nonce,
      address: merchantAddress,
      createdAt: Date.now(),
      expiresAt: Date.now() + 300000, // 5 minutes
      used: false
    };

    if (!this.nonceRegistry.has(merchantAddress)) {
      this.nonceRegistry.set(merchantAddress, []);
    }
    this.nonceRegistry.get(merchantAddress)!.push(sompiNonce);

    return sompiNonce;
  }

  /**
   * Create NFC/QR payment request with embedded nonce
   * Returns both data and QR code
   */
  async createPaymentRequest(
    merchantAddress: string,
    amount: number,
    metadata?: any
  ): Promise<PaymentRequest> {
    const nonce = await this.generateSompiNonce(merchantAddress);
    
    const paymentData = {
      version: '1.0',
      address: merchantAddress,
      amount,
      nonce: nonce.nonce,
      expires: nonce.expiresAt,
      network: this.config.network,
      metadata
    };

    const encoded = Buffer.from(JSON.stringify(paymentData)).toString('base64');
    const qrCode = await QRCode.toDataURL(encoded);

    return {
      encoded,
      qrCode,
      nonce: nonce.nonce,
      expiresAt: nonce.expiresAt,
      data: paymentData
    };
  }

  /**
   * Validate payment request and check if nonce is still valid
   */
  async validatePaymentRequest(encoded: string): Promise<boolean> {
    try {
      const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
      const data = JSON.parse(decoded);

      if (data.expires < Date.now()) {
        return false;
      }

      const nonces = this.nonceRegistry.get(data.address) || [];
      const nonce = nonces.find(n => n.nonce === data.nonce);

      return nonce !== undefined && !nonce.used && nonce.expiresAt > Date.now();
    } catch (error) {
      return false;
    }
  }

  /**
   * Mark nonce as used after payment
   */
  async markNonceUsed(merchantAddress: string, nonce: string): Promise<void> {
    const nonces = this.nonceRegistry.get(merchantAddress);
    if (nonces) {
      const found = nonces.find(n => n.nonce === nonce);
      if (found) {
        found.used = true;
      }
    }
  }

  /**
   * Get active nonces for merchant (for debugging/monitoring)
   */
  getActiveNonces(merchantAddress: string): SompiNonce[] {
    const nonces = this.nonceRegistry.get(merchantAddress) || [];
    return nonces.filter(n => !n.used && n.expiresAt > Date.now());
  }

  /**
   * Get merchant payment statistics
   */
  async getMerchantStats(merchantAddress: string): Promise<any> {
    const balance = await this.client.getBalance(merchantAddress);
    const activeNonces = this.getActiveNonces(merchantAddress);
    const allNonces = this.nonceRegistry.get(merchantAddress) || [];
    const usedNonces = allNonces.filter(n => n.used);

    return {
      address: merchantAddress,
      balance,
      activePaymentRequests: activeNonces.length,
      completedPayments: usedNonces.length,
      totalRequests: allNonces.length
    };
  }

  private createUniqueNonce(): string {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(8).toString('hex');
    return `${timestamp}-${random}`;
  }

  /**
   * Clean up expired nonces to prevent memory leaks
   */
  cleanupExpiredNonces(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [address, nonces] of this.nonceRegistry.entries()) {
      const active = nonces.filter(n => n.expiresAt > now);
      cleaned += nonces.length - active.length;

      if (active.length === 0) {
        this.nonceRegistry.delete(address);
      } else {
        this.nonceRegistry.set(address, active);
      }
    }

    if (cleaned > 0) {
      console.log(`Cleaned up ${cleaned} expired nonces`);
    }
  }

  shutdown(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}
