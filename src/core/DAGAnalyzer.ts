import { ProbabilityResult } from '../types';
import { KaspaClient } from './KaspaClient';

export class DAGAnalyzer {
  private client: KaspaClient;
  private blockCache: Map<string, any> = new Map();

  constructor(client: KaspaClient) {
    this.client = client;
  }

  /**
   * Analyzes DAG structure to calculate probability of transaction inclusion
   * Uses Kaspa's BlockDAG to determine confirmation confidence
   */
  async analyzeProbabilityOfInclusion(txId: string): Promise<ProbabilityResult> {
    try {
      const tx = await this.client.getTransaction(txId);
      
      if (!tx.acceptingBlockHash) {
        // Transaction not yet in a block
        return {
          txId,
          probability: 0,
          estimatedConfirmationTime: 1000,
          dagDepth: 0,
          timestamp: Date.now(),
          confirmingBlocks: 0
        };
      }

      const dagDepth = await this.calculateDAGDepth(tx.acceptingBlockHash);
      const confirmingBlocks = await this.countConfirmingBlocks(tx.acceptingBlockHash);
      const probability = this.calculateProbability(dagDepth, confirmingBlocks);
      
      return {
        txId,
        probability,
        estimatedConfirmationTime: this.estimateConfirmationTime(probability),
        dagDepth,
        confirmingBlocks,
        timestamp: Date.now()
      };
    } catch (error) {
      // Transaction might be in mempool
      return {
        txId,
        probability: 0,
        estimatedConfirmationTime: 1000,
        dagDepth: 0,
        confirmingBlocks: 0,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Calculate DAG depth by traversing from accepting block to virtual selected parent
   */
  private async calculateDAGDepth(blockHash: string): Promise<number> {
    try {
      const block = await this.getBlockWithCache(blockHash);
      const virtualBlueScore = await this.client.getVirtualSelectedParentBlueScore();
      
      // Depth is difference in blue score
      const depth = virtualBlueScore - block.blueScore;
      return Math.max(0, depth);
    } catch (error) {
      return 0;
    }
  }

  /**
   * Count blocks that confirm this transaction
   * In Kaspa's DAG, multiple blocks can confirm a transaction
   */
  private async countConfirmingBlocks(blockHash: string): Promise<number> {
    try {
      const block = await this.getBlockWithCache(blockHash);
      const virtualBlueScore = await this.client.getVirtualSelectedParentBlueScore();
      
      // Approximate confirming blocks based on blue score difference
      return Math.max(0, virtualBlueScore - block.blueScore);
    } catch (error) {
      return 0;
    }
  }

  /**
   * Calculate probability based on DAG depth and confirming blocks
   * Kaspa's fast block times mean high confidence quickly
   */
  private calculateProbability(dagDepth: number, confirmingBlocks: number): number {
    // Probability increases exponentially with depth
    // At depth 10+ (10 seconds), probability approaches 100%
    const depthFactor = 1 - Math.exp(-dagDepth / 3);
    const blockFactor = 1 - Math.exp(-confirmingBlocks / 5);
    
    // Combined probability (weighted average)
    const probability = (depthFactor * 0.6) + (blockFactor * 0.4);
    
    return Math.min(1, probability);
  }

  /**
   * Estimate time to reach 99% confidence
   */
  private estimateConfirmationTime(probability: number): number {
    if (probability >= 0.99) return 0;
    
    // Kaspa's 1 block/second means ~10 seconds for high confidence
    const remainingProbability = 0.99 - probability;
    return Math.ceil(remainingProbability * 10000);
  }

  /**
   * Get block with caching to reduce RPC calls
   */
  private async getBlockWithCache(blockHash: string): Promise<any> {
    if (this.blockCache.has(blockHash)) {
      return this.blockCache.get(blockHash);
    }

    const block = await this.client.getBlock(blockHash);
    this.blockCache.set(blockHash, block);
    
    // Limit cache size
    if (this.blockCache.size > 100) {
      const firstKey = this.blockCache.keys().next().value;
      if (firstKey) {
        this.blockCache.delete(firstKey);
      }
    }

    return block;
  }

  /**
   * Real-time monitoring of transaction probability
   */
  async *monitorTransaction(txId: string, intervalMs: number = 1000): AsyncGenerator<ProbabilityResult> {
    while (true) {
      const result = await this.analyzeProbabilityOfInclusion(txId);
      yield result;

      if (result.probability >= 0.99) {
        break;
      }

      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }
}
