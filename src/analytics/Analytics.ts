export interface AnalyticsEvent {
  type: string;
  timestamp: number;
  data: any;
}

export class Analytics {
  private events: AnalyticsEvent[] = [];
  private maxEvents: number = 10000;

  /**
   * Track event
   */
  track(type: string, data: any): void {
    this.events.push({
      type,
      timestamp: Date.now(),
      data
    });

    // Limit memory usage
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }
  }

  /**
   * Get events by type
   */
  getEvents(type: string, limit?: number): AnalyticsEvent[] {
    const filtered = this.events.filter(e => e.type === type);
    return limit ? filtered.slice(-limit) : filtered;
  }

  /**
   * Get events in time range
   */
  getEventsInRange(startTime: number, endTime: number): AnalyticsEvent[] {
    return this.events.filter(e => 
      e.timestamp >= startTime && e.timestamp <= endTime
    );
  }

  /**
   * Calculate metrics
   */
  calculateMetrics(type: string): any {
    const events = this.getEvents(type);
    
    if (events.length === 0) {
      return null;
    }

    const values = events.map(e => e.data.value).filter(v => typeof v === 'number');
    
    return {
      count: events.length,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      total: values.reduce((a, b) => a + b, 0)
    };
  }

  /**
   * Get summary
   */
  getSummary(): any {
    const types = [...new Set(this.events.map(e => e.type))];
    
    return {
      totalEvents: this.events.length,
      eventTypes: types.length,
      types: types.map(type => ({
        type,
        count: this.getEvents(type).length
      })),
      timeRange: {
        start: this.events[0]?.timestamp,
        end: this.events[this.events.length - 1]?.timestamp
      }
    };
  }

  /**
   * Export events as JSON
   */
  export(): string {
    return JSON.stringify(this.events, null, 2);
  }

  /**
   * Clear all events
   */
  clear(): void {
    this.events = [];
  }
}

export const analytics = new Analytics();
