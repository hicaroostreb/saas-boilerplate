# @workspace/rate-limiter

Enterprise-grade rate limiting package following Clean Architecture principles.

## Features

- Clean Architecture with Hexagonal Design
- TypeScript strict mode
- Multiple algorithms: Fixed Window, Sliding Window, Token Bucket
- Multiple storage: Memory, Redis
- Framework agnostic: Express, Fastify, Next.js
- Zero dependencies on business logic
- Fully testable and extensible

## Installation

bun install @workspace/rate-limiter

text

## Quick Start

### Express

import { createMemoryRateLimiter, createExpressRateLimit } from '@workspace/rate-limiter';

const rateLimiter = createMemoryRateLimiter({ windowMs: 60 \* 1000, maxRequests: 100, algorithm:
'sliding-window', });

const middleware = createExpressRateLimit(rateLimiter);

app.use(middleware);

text

### Next.js API Routes

import { createRedisRateLimiter, createNextRateLimit } from '@workspace/rate-limiter';

const rateLimiter = createRedisRateLimiter({ windowMs: 60 \* 1000, maxRequests: 100, algorithm:
'fixed-window', });

const middleware = createNextRateLimit(rateLimiter);

export default async function handler(req, res) { await middleware(req, res, () => {}); res.json({
message: 'OK' }); }

text

## Algorithms

### Fixed Window

Simple time-based windows with hard boundaries.

import { createMemoryRateLimiter } from '@workspace/rate-limiter';

const limiter = createMemoryRateLimiter({ windowMs: 60000, maxRequests: 100, algorithm:
'fixed-window', });

text

### Sliding Window

Smooth request distribution over time.

const limiter = createMemoryRateLimiter({ windowMs: 60000, maxRequests: 100, algorithm:
'sliding-window', });

text

### Token Bucket

Burst-friendly with token refill.

const limiter = createMemoryRateLimiter({ windowMs: 60000, maxRequests: 200, algorithm:
'token-bucket', });

text

## Storage

### Memory

For development and single-instance deployments.

import { createMemoryRateLimiter } from '@workspace/rate-limiter';

const limiter = createMemoryRateLimiter({ windowMs: 60000, maxRequests: 100, });

text

### Redis

For production and distributed deployments.

import { createRedisRateLimiter } from '@workspace/rate-limiter';

const limiter = createRedisRateLimiter( { windowMs: 60000, maxRequests: 100, }, { redis: { host:
'localhost', port: 6379, }, } );

text

## Presets

Quick configurations for common scenarios.

import { RateLimiterPresets } from '@workspace/rate-limiter';

const apiLimiter = RateLimiterPresets.api();

const authLimiter = RateLimiterPresets.auth();

const devLimiter = RateLimiterPresets.development();

text

## Custom Identifier Extraction

import { createRateLimitMiddleware, IdentifierExtractors } from '@workspace/rate-limiter';

const middleware = createRateLimitMiddleware(rateLimiter, { identifierExtractor:
IdentifierExtractors.user, });

const customMiddleware = createRateLimitMiddleware(rateLimiter, { identifierExtractor:
IdentifierExtractors.customHeader('X-API-Key'), });

const combinedMiddleware = createRateLimitMiddleware(rateLimiter, { identifierExtractor:
IdentifierExtractors.ipAndUser, });

text

## Custom Response Handlers

import { createRateLimitMiddleware, DefaultRateLimitHandlers } from '@workspace/rate-limiter';

const middleware = createRateLimitMiddleware(rateLimiter, { onLimitReached:
DefaultRateLimitHandlers.json({ message: 'Too many requests from this IP', statusCode: 429, }), });

text

## Architecture

This package follows Clean Architecture principles:

- **Domain Layer**: Pure business logic, entities, and ports
- **Infrastructure Layer**: Algorithms, gateways, middleware implementations
- **Factories**: Dependency injection and service composition
