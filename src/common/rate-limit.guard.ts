
import { Injectable, CanActivate, ExecutionContext, HttpException, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';

@Injectable()
export class RateLimitGuard implements CanActivate {
  private rateLimiter: RateLimiterRedis;
  private redisClient: Redis;

  constructor(@Inject(ConfigService) private readonly configService: ConfigService) {
    const redisHost = this.configService.get<string>('REDIS_HOST', 'localhost');
    const redisPort = this.configService.get<number>('REDIS_PORT', 6379);
    const redisPassword = this.configService.get<string>('REDIS_PASSWORD', '');
    this.redisClient = new Redis({
      host: redisHost,
      port: redisPort,
      password: redisPassword || undefined,
    });
    this.rateLimiter = new RateLimiterRedis({
      storeClient: this.redisClient,
      keyPrefix: 'rate-limit',
      points: 100, // 100 requests
      duration: 60, // per 60 seconds
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    // Use user id if available, otherwise fallback to IP
    const key = req.user?.id || req.ip;
    try {
      await this.rateLimiter.consume(key);
      return true;
    } catch (e) {
      throw new HttpException('Rate limit exceeded', 429);
    }
  }
}
