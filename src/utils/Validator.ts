export class Validator {
  /**
   * Validate Kaspa address format
   */
  static isValidKaspaAddress(address: string): boolean {
    if (!address) return false;
    
    // Kaspa addresses start with 'kaspa:' followed by base32 encoded data
    const kaspaRegex = /^kaspa:[a-z0-9]{61,63}$/;
    return kaspaRegex.test(address);
  }

  /**
   * Validate amount (must be positive integer in Sompi)
   */
  static isValidAmount(amount: number): boolean {
    return Number.isInteger(amount) && amount > 0;
  }

  /**
   * Validate transaction ID format
   */
  static isValidTxId(txId: string): boolean {
    if (!txId) return false;
    
    // Transaction IDs are typically 64 character hex strings
    const txIdRegex = /^[a-f0-9]{64}$/i;
    return txIdRegex.test(txId) || txId.startsWith('tx_') || txId.startsWith('anchor_') || txId.startsWith('covenant_');
  }

  /**
   * Validate device ID format
   */
  static isValidDeviceId(deviceId: string): boolean {
    if (!deviceId) return false;
    
    // Device IDs should be alphanumeric with hyphens/underscores
    const deviceIdRegex = /^[a-zA-Z0-9_-]{3,64}$/;
    return deviceIdRegex.test(deviceId);
  }

  /**
   * Validate game ID format
   */
  static isValidGameId(gameId: string): boolean {
    if (!gameId) return false;
    
    // Game IDs should be alphanumeric with hyphens/underscores
    const gameIdRegex = /^[a-zA-Z0-9_-]{3,64}$/;
    return gameIdRegex.test(gameId);
  }

  /**
   * Validate nonce format
   */
  static isValidNonce(nonce: string): boolean {
    if (!nonce) return false;
    
    // Nonces are timestamp-random format
    const nonceRegex = /^[a-z0-9]+-[a-f0-9]{16}$/;
    return nonceRegex.test(nonce);
  }

  /**
   * Sanitize string input
   */
  static sanitizeString(input: string, maxLength: number = 256): string {
    if (!input) return '';
    
    return input
      .trim()
      .substring(0, maxLength)
      .replace(/[<>]/g, ''); // Remove potential HTML tags
  }

  /**
   * Validate network type
   */
  static isValidNetwork(network: string): boolean {
    return network === 'mainnet' || network === 'testnet';
  }

  /**
   * Validate probability value
   */
  static isValidProbability(probability: number): boolean {
    return typeof probability === 'number' && 
           probability >= 0 && 
           probability <= 1;
  }

  /**
   * Validate timestamp
   */
  static isValidTimestamp(timestamp: number): boolean {
    const now = Date.now();
    const oneYearAgo = now - (365 * 24 * 60 * 60 * 1000);
    const oneYearFromNow = now + (365 * 24 * 60 * 60 * 1000);
    
    return timestamp > oneYearAgo && timestamp < oneYearFromNow;
  }
}
