# Booking Tracker

A small bookings API built to learn NestJS, MongoDB and Jest.

## Stack
NestJS 11 · TypeScript (strict) · MongoDB Atlas + Mongoose · class-validator · Jest

## Features
- CRUD for bookings (`/bookings`)
- DTO validation with whitelisting (unknown fields → 400)
- Invalid ObjectId → 400, missing booking → 404
- **Idempotent create**: same `idempotencyKey` + same payload returns the original booking; same key + different payload → 409

## Design decisions
- Idempotency is enforced by a **unique index** on `idempotencyKey`, not check-then-insert, so concurrent retries can't create duplicates. The service catches Mongo error 11000 and decides: replay or 409.
- [your words: why NotFoundException is thrown in the service]

## Run locally
cd api
cp .env.example .env   # add your MONGODB_URI
npm install
npm run start:dev

## Tests
npm test
8 unit tests for BookingsService using a mocked Mongoose model (via `getModelToken`): happy paths, not found, idempotent replay, conflict, and unexpected DB errors.

## What I'd improve next
- Store idempotency keys separately with a TTL so they outlive deleted bookings
- Integration tests with mongodb-memory-server to verify the unique index for real
- Pagination on GET /bookings, auth