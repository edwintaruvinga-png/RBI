# Market Intel

A monorepo containing a React client and a Node.js/Express API server for the
Market Intel application.

## Structure

```
.
├── client/             # React + TypeScript + Vite frontend
├── server/             # Node.js + Express + TypeScript API
├── docker-compose.yml  # PostgreSQL 16 database
└── README.md
```

## Prerequisites

- Node.js 20+ (developed against Node 22)
- npm 10+
- Docker (for the local PostgreSQL database)

## Getting started

### 1. Start the database

```bash
docker compose up -d
```

This runs PostgreSQL 16 on `localhost:5432` with database `market_intel`
(user `postgres`, password `postgres`).

### 2. Run the server

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

The API starts on http://localhost:4000. Health check:

```bash
curl http://localhost:4000/api/health
```

### 3. Run the client

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

The Vite dev server starts on http://localhost:5173.

## Scripts

### server/

| Script          | Description                          |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start the API with `tsx watch`       |
| `npm run build` | Compile TypeScript to `dist/`        |
| `npm start`     | Run the compiled server              |

### client/

| Script            | Description                |
| ----------------- | -------------------------- |
| `npm run dev`     | Start the Vite dev server  |
| `npm run build`   | Type-check and build       |
| `npm run preview` | Preview the production build |

## Notes

This repository currently contains runnable skeletons only — no business
logic is implemented yet.
