# Agent Guidelines for NestJS Template

This file contains guidelines for agentic coding agents working in this NestJS codebase.

## Build, Lint, and Test Commands

### Development Commands

- `npm run start:dev` - Start server in watch mode
- `npm run start:debug` - Start with debugging enabled
- `npm run build` - Build the application for production
- `npm run start:prod` - Run production build

### Code Quality

- `npm run lint` - Run ESLint and auto-fix issues
- `npm run format` - Format code with Prettier

### Testing Commands

- `npm run test` - Run all unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Run tests with coverage report
- `npm run test:e2e` - Run end-to-end tests
- **Single test**: `npm run test -- --testNamePattern="TestName"` or `npm run test path/to/test.spec.ts`

### Database Commands

- `npm run migration:run` - Run pending migrations
- `npm run migration:generate -- --name=migration_name` - Generate new migration
- `npm run migration:create -- --name=migration_name` - Create blank migration
- `npm run migration:revert` - Revert last migration

## Project Structure

```
src/
├── common/           # Shared utilities, guards, interceptors, decorators
├── config/           # Configuration files
├── modules/          # Feature modules (controllers, services, entities, DTOs)
├── utils/            # Utility functions
├── main.ts           # Application entry point
└── main.module.ts    # Root module
```

## Code Style Guidelines

### Import Organization

1. External libraries (nestjs/common, express, etc.)
2. Internal imports (@/modules/..., @/common/...)
3. Relative imports (./..., ../...)
4. Type-only imports: `import type { User } from './user.entity'`

### Naming Conventions

- **Files**: kebab-case (example.controller.ts, auth.service.ts)
- **Classes**: PascalCase (ExampleController, AuthService)
- **Methods/Variables**: camelCase (findAll, getUserById)
- **Constants**: UPPER_SNAKE_CASE (MAX_LIMIT, DEFAULT_PAGE_SIZE)
- **Entities**: PascalCase with Entity suffix if needed (User, Product)

### TypeScript Configuration

- No explicit function return types required (`@typescript-eslint/explicit-function-return-type: off`)
- No explicit module boundary types (`@typescript-eslint/explicit-module-boundary-types: off`)
- `any` type allowed (`@typescript-eslint/no-explicit-any: off`)
- Strict null checks disabled

### ESLint Rules

- Interface name prefix disabled
- Prettier integration enabled
- Node and Jest environments supported

### Prettier Configuration

- Single quotes
- Trailing commas: all
- Print width: 120 characters

## NestJS Patterns

### Module Structure

Each feature module should contain:

- `module.ts` - Module definition with imports/exports
- `controller.ts` - HTTP request handlers
- `service.ts` - Business logic
- `entity.ts` - Database model (extends MainEntityAbstract)
- `dto/` - Data transfer objects
  - `create-{resource}.dto.ts`
  - `update-{resource}.dto.ts`
- `test/` - Unit tests
  - `{resource}.service.spec.ts`
  - `{resource}.controller.spec.ts`

### Entity Guidelines

- Extend `MainEntityAbstract` for common fields (id, created_at, updated_at, etc.)
- Use `@Exclude()` decorator for sensitive fields
- Use TypeORM decorators (`@Column`, `@CreateDateColumn`, etc.)

### DTO Guidelines

- Use class-validator decorators for validation
- Use class-transformer decorators for transformation
- Use Swagger decorators for API documentation
- Extend `PaginationDto` for list endpoints

### Controller Guidelines

- Use dependency injection for services
- Apply appropriate decorators (@Get, @Post, @Put, @Delete)
- Use DTOs for request/response validation
- Apply guards for authentication/authorization

### Service Guidelines

- Mark with @Injectable()
- Use async/await for database operations
- Handle errors appropriately
- Use transactions when needed (typeorm-transactional)

### Error Handling

- Use NestJS built-in exceptions (BadRequestException, UnauthorizedException, etc.)
- Apply global exception interceptors
- Use ValidationPipe with whitelist and transform options

### Authentication & Authorization

- JWT-based authentication using JwtAuthGuard
- Role-based access control using RoleGuard
- Custom decorators for user extraction (@JwtPayload) and roles (@Role)

### Database Patterns

- Use TypeORM with PostgreSQL
- Repository pattern or query builder
- Soft deletes enabled via MainEntityAbstract
- Migration-based schema changes

### Testing Guidelines

- Use Jest testing framework
- Mock external dependencies
- Test both happy paths and error cases
- Follow naming convention: `{resource}.service.spec.ts`
- Use TestingModule for dependency injection setup

### API Documentation

- Use Swagger decorators (@ApiProperty, @ApiOperation)
- Global API prefix: `/api`
- Swagger UI available at: `/:v/docs`
- Bearer authentication enabled

### Configuration Management

- Use @nestjs/config for environment variables
- Separate config files in `src/config/`
- Type-safe configuration using ConfigService

This template follows NestJS best practices and provides a solid foundation for building scalable backend applications.
