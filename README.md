# NestJS Microservices Template

<p align="center">
  <a href="https://nestjs.com/" target="blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="200" alt="NestJS Logo" />
  </a>
</p>

<p align="center">
  A production-ready NestJS microservices template with Docker, observability, caching, and security best practices.
</p>

<p align="center">
  <a href="https://www.npmjs.com/~nestjscore" target="_blank">
    <img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" />
  </a>
  <a href="https://opensource.org/licenses/MIT" target="_blank">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License" />
  </a>
  <a href="https://github.com/anomalyco/opencode/issues" target="_blank">
    <img src="https://img.shields.io/badge/Support-Open%20Source-blue.svg" alt="Support" />
  </a>
</p>

## 🚀 Features

### Infrastructure & Containerization

- **Docker Support** - Multi-stage builds for production and development
- **Docker Compose** - Local development with PostgreSQL and Redis
- **Environment Configuration** - Type-safe config with Joi validation

### Observability & Monitoring

- **Structured Logging** - Pino-based logging with correlation IDs
- **Health Checks** - Liveness, readiness, and full health endpoints
- **Prometheus Metrics** - HTTP request and database query metrics

### Caching & Performance

- **Redis Integration** - Connection with graceful fallback
- **Cache Service** - Get/set/delete with TTL support
- **Connection Resilience** - Auto-retry with fallback

### Security

- **Helmet** - Security headers middleware
- **Rate Limiting** - Throttler with configurable limits
- **JWT Authentication** - Access and refresh token support
- **Validation** - Whitelist and transform with class-validator

### API & Documentation

- **Swagger/OpenAPI** - Interactive API documentation
- **Global Prefix** - API versioning ready (`/api`)
- **Error Handling** - Standardized error responses

## 📁 Project Structure

```
src/
├── common/
│   ├── cache/           # Redis caching service
│   ├── constants/       # Application constants
│   ├── decorator/       # Custom decorators
│   ├── dto/             # Data transfer objects
│   ├── guard/           # Auth guards
│   ├── health/          # Health check endpoints
│   ├── interface/       # TypeScript interfaces
│   ├── interceptor/     # Response/error interceptors
│   ├── logging/         # Structured logging
│   └── metrics/         # Prometheus metrics
├── config/              # Configuration files
├── modules/             # Feature modules
│   ├── auth/           # Authentication module
│   └── example/        # Example module
├── utils/              # Utility functions
├── main.ts             # Application entry point
└── main.module.ts      # Root module
```

## 🛠 Installation

```bash
# Install dependencies
bun install

# Copy environment file
cp .example.env .env

# Edit .env with your configuration
```

## 🐳 Docker Development

```bash
# Start all services (app, postgres, redis)
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

### Manual Development

```bash
# Start PostgreSQL and Redis first, then:
bun run start:dev
```

## 🏃 Running the Application

```bash
# Development with hot reload
bun run start:dev

# Production build
bun run build
bun run start:prod

# Debug mode
bun run start:debug
```

## 🧪 Testing

```bash
# Unit tests
bun run test

# Watch mode
bun run test:watch

# Test coverage
bun run test:cov

# E2E tests
bun run test:e2e
```

## 📊 Health & Metrics Endpoints

| Endpoint            | Description                    |
| ------------------- | ------------------------------ |
| `GET /health`       | Full health check (DB + Redis) |
| `GET /health/live`  | Liveness probe                 |
| `GET /health/ready` | Readiness probe (DB only)      |
| `GET /metrics`      | Prometheus metrics             |

## 🔧 Configuration

### Environment Variables

| Variable                      | Description                               | Default       |
| ----------------------------- | ----------------------------------------- | ------------- |
| `NODE_ENV`                    | Environment (development/production/test) | `development` |
| `PORT`                        | Application port                          | `3000`        |
| `JWT_SECRET_KEY`              | JWT signing secret                        | -             |
| `JWT_EXPIRATION_TIME`         | Access token expiration                   | `1h`          |
| `JWT_REFRESH_SECRET_KEY`      | Refresh token secret                      | -             |
| `JWT_REFRESH_EXPIRATION_TIME` | Refresh token expiration                  | `7d`          |
| `DATABASE_HOST`               | PostgreSQL host                           | `localhost`   |
| `DATABASE_PORT`               | PostgreSQL port                           | `5432`        |
| `DATABASE_NAME`               | Database name                             | `app`         |
| `REDIS_HOST`                  | Redis host                                | `localhost`   |
| `REDIS_PORT`                  | Redis port                                | `6379`        |
| `THROTTLE_TTL`                | Rate limit window (seconds)               | `60`          |
| `THROTTLE_LIMIT`              | Requests per window                       | `100`         |

## 📖 API Documentation

Access Swagger UI at: `http://localhost:3000/docs`

## 🔐 Authentication

The template includes JWT-based authentication with Google OAuth support:

```typescript
// Example: Protected endpoint
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@Req() req) {
  return req.user;
}
```

## 📝 Module Generator

Create new modules using NestJS CLI:

```bash
nest g module modules/users
nest g controller modules/users
nest g service modules/users
```

## 🐳 Docker Production Build

```bash
# Build image
docker build -t nestjs-microservice .

# Run container
docker run -p 3000:3000 nestjs-microservice
```

## 📄 License

This project is licensed under the MIT License.

## 🙏 Support

For issues and feature requests, please create an issue in the repository.
