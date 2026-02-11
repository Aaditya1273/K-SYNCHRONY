export class KSynchronyError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'KSynchronyError';
  }
}

export class NetworkError extends KSynchronyError {
  constructor(message: string, details?: any) {
    super(message, 'NETWORK_ERROR', details);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends KSynchronyError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class TransactionError extends KSynchronyError {
  constructor(message: string, details?: any) {
    super(message, 'TRANSACTION_ERROR', details);
    this.name = 'TransactionError';
  }
}

export class GameError extends KSynchronyError {
  constructor(message: string, details?: any) {
    super(message, 'GAME_ERROR', details);
    this.name = 'GameError';
  }
}

export class IoTError extends KSynchronyError {
  constructor(message: string, details?: any) {
    super(message, 'IOT_ERROR', details);
    this.name = 'IoTError';
  }
}

export class ErrorHandler {
  static handle(error: any): KSynchronyError {
    if (error instanceof KSynchronyError) {
      return error;
    }

    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return new NetworkError('Failed to connect to Kaspa network', error);
    }

    if (error.message?.includes('invalid address')) {
      return new ValidationError('Invalid Kaspa address', error);
    }

    if (error.message?.includes('transaction')) {
      return new TransactionError('Transaction failed', error);
    }

    return new KSynchronyError(
      error.message || 'Unknown error',
      'UNKNOWN_ERROR',
      error
    );
  }

  static isRetryable(error: KSynchronyError): boolean {
    return error instanceof NetworkError;
  }

  static async retry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000
  ): Promise<T> {
    let lastError: any;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = ErrorHandler.handle(error);
        
        if (!ErrorHandler.isRetryable(lastError) || i === maxRetries - 1) {
          throw lastError;
        }

        await new Promise(resolve => setTimeout(resolve, delayMs * (i + 1)));
      }
    }

    throw lastError;
  }
}
