import { Injectable } from '@nestjs/common';
import * as client from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly register: client.Registry;

  private readonly httpRequestDuration: client.Histogram<string>;
  private readonly httpRequestTotal: client.Counter<string>;
  private readonly httpResponseTotal: client.Counter<string>;

  private readonly databaseQueryDuration: client.Histogram<string>;
  private readonly databaseQueryTotal: client.Counter<string>;

  private readonly cacheHitTotal: client.Counter<string>;
  private readonly cacheMissTotal: client.Counter<string>;

  constructor() {
    this.register = new client.Registry();

    this.register.setDefaultLabels({
      app: 'nestjs-microservice',
    });

    client.collectDefaultMetrics({ register: this.register });

    this.httpRequestDuration = new client.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
    });

    this.httpRequestTotal = new client.Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route'],
    });

    this.httpResponseTotal = new client.Counter({
      name: 'http_responses_total',
      help: 'Total number of HTTP responses',
      labelNames: ['method', 'route', 'status_code'],
    });

    this.databaseQueryDuration = new client.Histogram({
      name: 'database_query_duration_seconds',
      help: 'Duration of database queries in seconds',
      labelNames: ['query_type', 'table'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
    });

    this.databaseQueryTotal = new client.Counter({
      name: 'database_queries_total',
      help: 'Total number of database queries',
      labelNames: ['query_type', 'table'],
    });

    this.cacheHitTotal = new client.Counter({
      name: 'cache_hits_total',
      help: 'Total number of cache hits',
      labelNames: ['cache_type'],
    });

    this.cacheMissTotal = new client.Counter({
      name: 'cache_misses_total',
      help: 'Total number of cache misses',
      labelNames: ['cache_type'],
    });

    this.register.registerMetric(this.httpRequestDuration);
    this.register.registerMetric(this.httpRequestTotal);
    this.register.registerMetric(this.httpResponseTotal);
    this.register.registerMetric(this.databaseQueryDuration);
    this.register.registerMetric(this.databaseQueryTotal);
    this.register.registerMetric(this.cacheHitTotal);
    this.register.registerMetric(this.cacheMissTotal);
  }

  getRegister(): client.Registry {
    return this.register;
  }

  recordHttpRequest(method: string, route: string, duration: number, statusCode: number): void {
    this.httpRequestDuration.observe({ method, route, status_code: statusCode.toString() }, duration);
    this.httpRequestTotal.inc({ method, route });
    this.httpResponseTotal.inc({ method, route, status_code: statusCode.toString() });
  }

  recordDatabaseQuery(queryType: string, table: string, duration: number): void {
    this.databaseQueryDuration.observe({ query_type: queryType, table }, duration);
    this.databaseQueryTotal.inc({ query_type: queryType, table });
  }

  recordCacheHit(cacheType: string): void {
    this.cacheHitTotal.inc({ cache_type: cacheType });
  }

  recordCacheMiss(cacheType: string): void {
    this.cacheMissTotal.inc({ cache_type: cacheType });
  }

  async getMetrics(): Promise<string> {
    return this.register.metrics();
  }
}
