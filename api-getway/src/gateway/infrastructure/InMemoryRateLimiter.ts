import { RateLimiterPort } from '../application/ports';

interface LimitConfig {
  maxRequests: number;
  windowMs: number;
}

export class InMemoryRateLimiter implements RateLimiterPort {
  private store = new Map<string, { count: number; resetAt: number }>();
  
  private config: Record<string, LimitConfig> = {
    strict: { maxRequests: 5, windowMs: 60000 },
    standard: { maxRequests: 60, windowMs: 60000 },
    relaxed: { maxRequests: 300, windowMs: 60000 },
  };

  async isAllowed(clientIp: string, rateLimitType: string): Promise<boolean> {
    const limitConfig = this.config[rateLimitType] || this.config.standard;
    const key = `${clientIp}:${rateLimitType}`;
    const now = Date.now();
    
    let record = this.store.get(key);
    
    if (!record || now > record.resetAt) {
      record = { count: 1, resetAt: now + limitConfig.windowMs };
      this.store.set(key, record);
      return true;
    }
    
    if (record.count >= limitConfig.maxRequests) {
      return false;
    }
    
    record.count++;
    return true;
  }
}
