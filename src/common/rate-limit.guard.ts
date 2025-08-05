import { Injectable, CanActivate, ExecutionContext, HttpException } from '@nestjs/common';
import { RateLimiterMemory } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterMemory({
  points: 100, // 100 requests
  duration: 60, // per 60 seconds
});

@Injectable()
export class RateLimitGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const key = req.ip;
    try {
      await rateLimiter.consume(key);
      return true;
    } catch (e) {
      throw new HttpException('Rate limit exceeded', 429);
    }
  }
}
