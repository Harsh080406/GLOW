# GLOW Database Architecture & Schema

This directory contains database DDL migration scripts and demo data seeds for the GLOW Enterprise Campus Transit & Fleet Management System.

## Directory Layout

- `migrations/`: DDL table definitions and schema updates.
  - `001_initial_schema.sql`: Core tables (`users`, `buses`, `routes`, `student_passes`, `fee_transactions`, `emergency_events`).
- `seeds/`: Initial records for development and testing environments.
  - `001_initial_seeds.sql`: Default administrative accounts, buses, and routes.

## Entity Relationship Overview

```
 [Users] 1────N [Student Passes] N────1 [Routes]
    │                                      │
    ├────N [Fee Transactions]              │
    │                                      │
    └────1 [Buses] N───────────────────────┘
            │
            └────N [Emergency Events]
```
