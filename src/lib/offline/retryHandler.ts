// NaLI Offline Engine: Retry Handler
// Implements exponential backoff for field environments with spotty connections.

export class RetryHandler {
  private maxRetries: number;
  private baseDelayMs: number;

  constructor(maxRetries = 5, baseDelayMs = 1000) {
    this.maxRetries = maxRetries;
    this.baseDelayMs = baseDelayMs;
  }

  calculateBackoff(retryCount: number): number {
    // Exponential backoff with jitter
    const exponential = Math.pow(2, retryCount) * this.baseDelayMs;
    const jitter = Math.random() * 500;
    return exponential + jitter;
  }

  async execute<T>(operation: () => Promise<T>, currentRetry = 0): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (currentRetry >= this.maxRetries) {
        throw new Error(`Operation failed after ${this.maxRetries} retries.`);
      }

      const delay = this.calculateBackoff(currentRetry);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return this.execute(operation, currentRetry + 1);
    }
  }
}

export const retryHandler = new RetryHandler();
