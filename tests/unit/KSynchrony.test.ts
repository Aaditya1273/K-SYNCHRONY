import { KSynchrony } from '../../src/KSynchrony';

describe('KSynchrony', () => {
  let ks: KSynchrony;

  beforeEach(() => {
    ks = new KSynchrony({
      network: 'testnet',
      apiEndpoint: 'testnet.kaspathon.com'
    });
  });

  afterEach(() => {
    if (ks) {
      ks.shutdown();
    }
  });

  describe('Initialization', () => {
    test('should create instance with config', () => {
      expect(ks).toBeDefined();
      expect(ks.payments).toBeDefined();
      expect(ks.gaming).toBeDefined();
      expect(ks.iot).toBeDefined();
    });

    test('should return config', () => {
      const config = ks.getConfig();
      expect(config.network).toBe('testnet');
      expect(config.apiEndpoint).toBe('testnet.kaspathon.com');
    });

    test('should use default endpoint for testnet', () => {
      const testKs = new KSynchrony({ network: 'testnet' });
      const config = testKs.getConfig();
      expect(config.apiEndpoint).toBe('testnet.kaspathon.com');
      testKs.shutdown();
    });

    test('should use default endpoint for mainnet', () => {
      const mainKs = new KSynchrony({ network: 'mainnet' });
      const config = mainKs.getConfig();
      expect(config.apiEndpoint).toBe('mainnet.kaspathon.com');
      mainKs.shutdown();
    });
  });

  describe('Engines', () => {
    test('should have payment engine', () => {
      expect(ks.payments).toBeDefined();
      expect(typeof ks.payments.createPaymentRequest).toBe('function');
      expect(typeof ks.payments.getProbabilityOfInclusion).toBe('function');
    });

    test('should have gaming engine', () => {
      expect(ks.gaming).toBeDefined();
      expect(typeof ks.gaming.createGame).toBe('function');
      expect(typeof ks.gaming.submitMove).toBe('function');
    });

    test('should have iot engine', () => {
      expect(ks.iot).toBeDefined();
      expect(typeof ks.iot.anchorData).toBe('function');
      expect(typeof ks.iot.anchorWithCovenant).toBe('function');
    });
  });

  describe('Client', () => {
    test('should have client', () => {
      const client = ks.getClient();
      expect(client).toBeDefined();
    });
  });

  describe('Shutdown', () => {
    test('should shutdown without errors', () => {
      expect(() => ks.shutdown()).not.toThrow();
    });
  });
});
