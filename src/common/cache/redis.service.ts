import { Injectable, OnModuleDestroy, Logger, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private isConnected = false;

  constructor() {
    this.initClient();
  }

  private initClient(): void {
    try {
      this.client = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || undefined,
        db: parseInt(process.env.REDIS_DB || '0'),
        retryStrategy: (times: number) => {
          if (times > 3) {
            this.logger.warn('Redis connection failed after 3 retries, continuing without Redis');
            return null;
          }
          return Math.min(times * 200, 2000);
        },
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        this.logger.log('Redis connected');
      });

      this.client.on('error', (err: Error) => {
        if (!this.isConnected) {
          this.logger.warn(`Redis connection error: ${err.message}`);
        }
      });

      this.client.on('close', () => {
        this.isConnected = false;
      });

      this.client.connect().catch((err: Error) => {
        this.logger.warn(`Redis connection failed: ${err.message}, caching will be disabled`);
      });
    } catch (error) {
      this.logger.warn('Failed to initialize Redis client, caching will be disabled');
    }
  }

  onModuleInit() {
    // Redis is initialized in constructor
  }

  getClient(): Redis | null {
    return this.client;
  }

  isReady(): boolean {
    return this.isConnected && this.client !== null;
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      try {
        await this.client.quit();
      } catch {
        // Ignore close errors
      }
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isReady() || !this.client) return null;
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    if (!this.isReady() || !this.client) return;
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, serialized);
      } else {
        await this.client.set(key, serialized);
      }
    } catch (error) {
      this.logger.error(`Redis set error: ${error}`);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isReady() || !this.client) return;
    try {
      await this.client.del(key);
    } catch (error) {
      this.logger.error(`Redis del error: ${error}`);
    }
  }

  async delPattern(pattern: string): Promise<void> {
    if (!this.isReady() || !this.client) return;
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (error) {
      this.logger.error(`Redis delPattern error: ${error}`);
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.isReady() || !this.client) return false;
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch {
      return false;
    }
  }

  async incr(key: string): Promise<number> {
    if (!this.isReady() || !this.client) return 0;
    try {
      return await this.client.incr(key);
    } catch {
      return 0;
    }
  }

  async expire(key: string, seconds: number): Promise<void> {
    if (!this.isReady() || !this.client) return;
    try {
      await this.client.expire(key, seconds);
    } catch (error) {
      this.logger.error(`Redis expire error: ${error}`);
    }
  }
}
