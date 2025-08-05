# Architectural Decision Record (ADR)

## Context

This project is a notification service API built with NestJS, using PostgreSQL and TypeORM for persistence, Bull and Redis for queueing, and JWT for authentication. The technical requirements specified the use of PostgreSQL and TypeORM, although Prisma would have been the preferred choice for its developer experience and type safety.

## Key Architectural Decisions

### 1. Database: PostgreSQL with TypeORM
- **Decision:** PostgreSQL was selected as the database, and TypeORM as the ORM.
- **Rationale:** These were explicitly required by the technical challenge. Prisma was considered but not chosen due to requirements.

### 2. Queueing and Event-Driven Architecture (EDA): Bull with Redis
- **Decision:** The Bull library is used for job queueing, backed by Redis.
- **Rationale:** Bull provides robust queueing and concurrency support, enabling scalable notification processing. Redis is used as the queue backend for performance and reliability.

### 3. Rate Limiting: rate-limiter-flexible
- **Decision:** The `rate-limiter-flexible` package is used to implement per-user rate limiting.
- **Rationale:** This package allows for flexible, distributed rate limiting strategies, supporting individual user limits and integration with Redis for persistence.

### 4. Omitted Features (Due to Time Constraints)
The following features were considered but not implemented due to time constraints:
- **Bulk notifications:** Sending to multiple users in a single request.
- **Per-user rate limiting:** (Basic support implemented, but not advanced strategies.)
- **Redis caching:** Caching user preferences or frequent queries.
- **WebSocket support:** Real-time notification delivery (would have been the next priority).
- **Scheduled notifications:** Support for future delivery timestamps.
- **Notification templates:** Reusable templates with variable substitution.

WebSocket support was identified as the highest priority for future work, to enable real-time notification delivery.

## Summary
- **PostgreSQL + TypeORM**: Chosen per requirements, despite Prisma preference.
- **Bull + Redis**: Enables scalable, concurrent notification processing.
- **rate-limiter-flexible**: Implements rate limiting at the user level.
- **Omitted features**: Bulk notifications, advanced rate limiting, Redis caching, WebSockets, scheduling, and templates—WebSockets would be prioritized next.

This ADR documents the rationale behind the current architecture and highlights areas for future improvement.
