export class Formatter {
  /**
   * Convert Sompi to KAS
   */
  static sompiToKAS(sompi: number): number {
    return sompi / 100000000;
  }

  /**
   * Convert KAS to Sompi
   */
  static kasToSompi(kas: number): number {
    return Math.floor(kas * 100000000);
  }

  /**
   * Format KAS amount with proper decimals
   */
  static formatKAS(sompi: number, decimals: number = 8): string {
    const kas = this.sompiToKAS(sompi);
    return kas.toFixed(decimals);
  }

  /**
   * Format address for display (truncate middle)
   */
  static formatAddress(address: string, startChars: number = 10, endChars: number = 8): string {
    if (address.length <= startChars + endChars) {
      return address;
    }
    return `${address.substring(0, startChars)}...${address.substring(address.length - endChars)}`;
  }

  /**
   * Format transaction ID for display
   */
  static formatTxId(txId: string, chars: number = 16): string {
    if (txId.length <= chars) {
      return txId;
    }
    return `${txId.substring(0, chars)}...`;
  }

  /**
   * Format probability as percentage
   */
  static formatProbability(probability: number, decimals: number = 2): string {
    return `${(probability * 100).toFixed(decimals)}%`;
  }

  /**
   * Format timestamp to readable date
   */
  static formatTimestamp(timestamp: number): string {
    return new Date(timestamp).toISOString();
  }

  /**
   * Format duration in milliseconds to human readable
   */
  static formatDuration(ms: number): string {
    if (ms < 1000) {
      return `${ms}ms`;
    }
    if (ms < 60000) {
      return `${(ms / 1000).toFixed(1)}s`;
    }
    if (ms < 3600000) {
      return `${(ms / 60000).toFixed(1)}m`;
    }
    return `${(ms / 3600000).toFixed(1)}h`;
  }

  /**
   * Format file size
   */
  static formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(2)}KB`;
    if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(2)}MB`;
    return `${(bytes / 1073741824).toFixed(2)}GB`;
  }

  /**
   * Format temperature
   */
  static formatTemperature(celsius: number, decimals: number = 1): string {
    return `${celsius.toFixed(decimals)}°C`;
  }

  /**
   * Format humidity
   */
  static formatHumidity(humidity: number, decimals: number = 1): string {
    return `${humidity.toFixed(decimals)}%`;
  }

  /**
   * Create progress bar
   */
  static progressBar(value: number, max: number = 1, width: number = 20): string {
    const percentage = value / max;
    const filled = Math.floor(percentage * width);
    const empty = width - filled;
    return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${this.formatProbability(percentage)}`;
  }
}
