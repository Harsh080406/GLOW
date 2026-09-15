# GLOW Enterprise Architecture Overview

## Monorepo Layout

```
GLOW/
├── frontend/               # Single Page Application (React 19 + Vite)
├── backend/                # REST API Backend Service (Express.js)
├── database/               # SQL DDL Migrations & Seed Data
├── docs/                   # Architecture Specifications & Diagrams
├── package.json            # Monorepo Workspace Configuration
└── README.md               # Repository Overview
```

## System Topology

1. **Frontend Tier (`frontend/`)**: Vite-powered React SPA with responsive role-based dashboards (Admin, Driver, Finance, Transport, Student).
2. **Backend API Tier (`backend/`)**: Express REST API exposing authentication, telemetry monitoring, fee reconciliation, and SOS dispatch endpoints.
3. **Database Tier (`database/`)**: Relational database storage for system entities, audit logs, transactions, and bus telemetry event streams.
