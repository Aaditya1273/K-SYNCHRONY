import { PaymentEngine } from '../payments/PaymentEngine';
import { Formatter } from '../utils/Formatter';

export interface DashboardStats {
  totalRevenue: number;
  totalTransactions: number;
  activeRequests: number;
  averageTransactionValue: number;
  successRate: number;
  recentTransactions: Array<{
    txId: string;
    amount: number;
    timestamp: number;
    status: 'pending' | 'confirmed' | 'failed';
  }>;
}

export class MerchantDashboard {
  private paymentEngine: PaymentEngine;
  private merchantAddress: string;
  private transactions: Map<string, any> = new Map();

  constructor(paymentEngine: PaymentEngine, merchantAddress: string) {
    this.paymentEngine = paymentEngine;
    this.merchantAddress = merchantAddress;
  }

  /**
   * Get comprehensive dashboard statistics
   */
  async getStats(): Promise<DashboardStats> {
    const merchantStats = await this.paymentEngine.getMerchantStats(this.merchantAddress);
    const transactions = Array.from(this.transactions.values());
    
    const totalRevenue = transactions
      .filter(t => t.status === 'confirmed')
      .reduce((sum, t) => sum + t.amount, 0);

    const confirmedCount = transactions.filter(t => t.status === 'confirmed').length;
    const totalCount = transactions.length;

    return {
      totalRevenue,
      totalTransactions: totalCount,
      activeRequests: merchantStats.activePaymentRequests,
      averageTransactionValue: totalCount > 0 ? totalRevenue / confirmedCount : 0,
      successRate: totalCount > 0 ? confirmedCount / totalCount : 0,
      recentTransactions: transactions
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10)
    };
  }

  /**
   * Track new transaction
   */
  trackTransaction(txId: string, amount: number): void {
    this.transactions.set(txId, {
      txId,
      amount,
      timestamp: Date.now(),
      status: 'pending'
    });
  }

  /**
   * Update transaction status
   */
  updateTransactionStatus(txId: string, status: 'confirmed' | 'failed'): void {
    const tx = this.transactions.get(txId);
    if (tx) {
      tx.status = status;
    }
  }

  /**
   * Generate dashboard report
   */
  async generateReport(): Promise<string> {
    const stats = await this.getStats();
    
    return `
╔════════════════════════════════════════════════════════════╗
║              MERCHANT DASHBOARD REPORT                     ║
╚════════════════════════════════════════════════════════════╝

Merchant Address: ${Formatter.formatAddress(this.merchantAddress)}

REVENUE METRICS
───────────────────────────────────────────────────────────
Total Revenue:        ${Formatter.formatKAS(stats.totalRevenue)} KAS
Total Transactions:   ${stats.totalTransactions}
Average Value:        ${Formatter.formatKAS(stats.averageTransactionValue)} KAS
Success Rate:         ${Formatter.formatProbability(stats.successRate)}

CURRENT STATUS
───────────────────────────────────────────────────────────
Active Requests:      ${stats.activeRequests}

RECENT TRANSACTIONS
───────────────────────────────────────────────────────────
${stats.recentTransactions.map((tx, i) => `
${i + 1}. ${Formatter.formatTxId(tx.txId)}
   Amount: ${Formatter.formatKAS(tx.amount)} KAS
   Status: ${tx.status.toUpperCase()}
   Time:   ${Formatter.formatTimestamp(tx.timestamp)}
`).join('')}

Generated: ${new Date().toISOString()}
    `;
  }

  /**
   * Display live dashboard in console
   */
  async displayLive(intervalMs: number = 5000): Promise<void> {
    const display = async () => {
      console.clear();
      const report = await this.generateReport();
      console.log(report);
    };

    await display();
    setInterval(display, intervalMs);
  }
}
