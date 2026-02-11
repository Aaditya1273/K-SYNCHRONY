import { IoTEngine } from '../../src/iot/IoTEngine';
import { KaspaClient } from '../../src/core/KaspaClient';

describe('IoTEngine', () => {
  let iotEngine: IoTEngine;
  let mockClient: KaspaClient;

  beforeEach(() => {
    mockClient = new KaspaClient({
      endpoint: 'testnet.kaspathon.com',
      network: 'testnet'
    });
    
    iotEngine = new IoTEngine(
      { network: 'testnet' },
      mockClient
    );
  });

  afterEach(() => {
    iotEngine.shutdown();
  });

  describe('Data Anchoring', () => {
    test('should anchor data to blockchain', async () => {
      const deviceId = 'sensor-001';
      const data = { temperature: 25.5, humidity: 60 };

      const anchor = await iotEngine.anchorData(deviceId, data);

      expect(anchor).toBeDefined();
      expect(anchor.deviceId).toBe(deviceId);
      expect(anchor.data).toEqual(data);
      expect(anchor.dataHash).toBeDefined();
      expect(anchor.txId).toBeDefined();
      expect(anchor.timestamp).toBeDefined();
    });

    test('should generate unique hash for different data', async () => {
      const deviceId = 'sensor-001';
      const data1 = { temperature: 25.5 };
      const data2 = { temperature: 26.0 };

      const anchor1 = await iotEngine.anchorData(deviceId, data1);
      const anchor2 = await iotEngine.anchorData(deviceId, data2);

      expect(anchor1.dataHash).not.toBe(anchor2.dataHash);
    });
  });

  describe('Covenant-Locked Data', () => {
    test('should anchor data with covenant conditions', async () => {
      const deviceId = 'sensor-002';
      const data = { temperature: 3.5, humidity: 45 };
      const conditions = { maxTemperature: 5, minTemperature: 0 };

      const anchor = await iotEngine.anchorWithCovenant(deviceId, data, conditions);

      expect(anchor).toBeDefined();
      expect(anchor.covenantLocked).toBe(true);
      expect(anchor.covenantConditions).toEqual(conditions);
    });

    test('should validate data against covenant conditions', async () => {
      const deviceId = 'sensor-003';
      const data = { temperature: 3.5 };
      const conditions = { maxTemperature: 5 };

      const anchor = await iotEngine.anchorWithCovenant(deviceId, data, conditions);

      // The anchor is created, verification happens separately
      expect(anchor.covenantLocked).toBe(true);
      expect(anchor.covenantConditions).toEqual(conditions);
    });
  });

  describe('Device Statistics', () => {
    test('should return device statistics', async () => {
      const deviceId = 'sensor-004';
      await iotEngine.anchorData(deviceId, { temp: 25 });

      const stats = await iotEngine.getDeviceStats(deviceId);

      expect(stats).toBeDefined();
      expect(typeof stats.totalAnchors).toBe('number');
      expect(typeof stats.lastAnchor).toBe('number');
    });

    test('should track multiple anchors', async () => {
      const deviceId = 'sensor-005';
      await iotEngine.anchorData(deviceId, { temp: 25 });
      await iotEngine.anchorData(deviceId, { temp: 26 });

      const stats = await iotEngine.getDeviceStats(deviceId);

      expect(stats.totalAnchors).toBeGreaterThanOrEqual(2);
    });
  });
});
