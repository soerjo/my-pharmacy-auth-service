import { Injectable, OnModuleInit, Inject, Logger } from '@nestjs/common';
import { RedisService } from '../cache/redis.service';

@Injectable()
export class MetricsInterceptor implements OnModuleInit {
  private readonly logger = new Logger(MetricsInterceptor.name);

  constructor(
    @Inject(RedisService)
    private readonly redisService: RedisService,
  ) {}

  onModuleInit() {
    this.startRedisMonitoring();
  }

  private startRedisMonitoring(): void {
    const client = this.redisService.getClient();

    client.info('stats').then((info) => {
      const lines = info.split('\r\n');
      const keyspaceLine = lines.find((line) => line.startsWith('db0'));
      if (keyspaceLine) {
        const matches = keyspaceLine.match(/keys=(\d+),expires=(\d+)/);
        if (matches) {
          this.logger.log(`Redis keys: ${matches[1]}, expires: ${matches[2]}`);
        }
      }
    });

    setInterval(async () => {
      try {
        const info = await client.info('stats');
        const lines = info.split('\r\n');
        const keyspaceLine = lines.find((line) => line.startsWith('db0'));
        if (keyspaceLine) {
          const matches = keyspaceLine.match(/keys=(\d+),expires=(\d+)/);
          if (matches) {
            this.logger.log(`Redis keys: ${matches[1]}, expires: ${matches[2]}`);
          }
        }
      } catch (error) {
        this.logger.error('Redis monitoring error:', error);
      }
    }, 30000);
  }
}
