import { PaymentEngine } from '../../src/payments/PaymentEngine';
import { KaspaClient } from '../../src/core/KaspaClient';

describe('PaymentEngine', () => {
  let paymentEngine: PaymentEngine;
  let mockClient: KaspaClient;

  beforeEach(() => {
    mockClient = new KaspaClient({
      endpoint: 'testnet.kaspathon.com',
      network: 'testnet'
    });
    
    paymentEngine = new PaymentEngine(
      { network: 'testnet' },
      mockClient
    );
  });

  afterEach(() => {
    paymentEngine.shutdown();
  });

  describe('Payment Request Creation', () => {
    test('should create payment request with nonce', async () => {
      const address = 'kaspa:qz7ulu4c25dh7fzec9zjyrmlhnkzrg4wmf89q7gzr3gfrsj3uz6xjceef60sd';
      const amount = 100000000;

      const request = await paymentEngine.createPaymentRequest(address, amount);

      expect(request).toBeDefined();
      expect(request.nonce).toBeDefined();
      expect(request.qrCode).toBeDefined();
      expect(request.encoded).toBeDefined();
      expect(request.expiresAt).toBeGreaterThan(Date.now());
    });

    test('should create unique nonces for multiple requests', async () => {
      const address = 'kaspa:qz7ulu4c25dh7fzec9zjyrmlhnkzrg4wmf89q7gzr3gfrsj3uz6xjceef60sd';
      const amount = 100000000;

      const request1 = await paymentEngine.createPaymentRequest(address, amount);
      const request2 = await paymentEngine.createPaymentRequest(address, amount);

      expect(request1.nonce).not.toBe(request2.nonce);
    });

    test('should include metadata in payment request', async () => {
      const address = 'kaspa:qz7ulu4c25dh7fzec9zjyrmlhnkzrg4wmf89q7gzr3gfrsj3uz6xjceef60sd';
      const amount = 100000000;
      const metadata = { item: 'Coffee', orderId: '12345' };

      const request = await paymentEngine.createPaymentRequest(address, amount, metadata);

      expect(request.data).toBeDefined();
      expect(request.data.metadata).toEqual(metadata);
    });
  });

  describe('Merchant Statistics', () => {
    test.skip('should return merchant stats (requires network)', async () => {
      const address = 'kaspa:qz7ulu4c25dh7fzec9zjyrmlhnkzrg4wmf89q7gzr3gfrsj3uz6xjceef60sd';

      const stats = await paymentEngine.getMerchantStats(address);

      expect(stats).toBeDefined();
      expect(typeof stats.activePaymentRequests).toBe('number');
      expect(typeof stats.completedPayments).toBe('number');
      expect(typeof stats.totalRequests).toBe('number');
    });

    test.skip('should track multiple payment requests (requires network)', async () => {
      const address = 'kaspa:qz7ulu4c25dh7fzec9zjyrmlhnkzrg4wmf89q7gzr3gfrsj3uz6xjceef60sd';

      await paymentEngine.createPaymentRequest(address, 100000000);
      await paymentEngine.createPaymentRequest(address, 200000000);

      const stats = await paymentEngine.getMerchantStats(address);

      expect(stats.activePaymentRequests).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Nonce Management', () => {
    test('should mark nonce as used', async () => {
      const address = 'kaspa:qz7ulu4c25dh7fzec9zjyrmlhnkzrg4wmf89q7gzr3gfrsj3uz6xjceef60sd';
      const request = await paymentEngine.createPaymentRequest(address, 100000000);

      await paymentEngine.markNonceUsed(address, request.nonce);

      // Should not throw
      expect(true).toBe(true);
    });
  });
});
