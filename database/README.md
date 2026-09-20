# GLOW Database Architecture & Schemas (MongoDB / Mongoose)

This directory contains database schemas, entity relationship documentation, and seed data for the GLOW MERN Stack (MongoDB, Express.js, React.js, Node.js) Enterprise Campus Transit Platform.

## Database Engine
- **Database**: MongoDB 7.0 / MongoDB Atlas
- **Object Data Modeling (ODM)**: Mongoose 8.x

## Collections & Schemas
- `users`: User profiles across all 5 roles (`student`, `driver`, `super_admin`, `transport_manager`, `finance_admin`).
- `buses`: Fleet inventory, GPS telemetry status, fuel/battery level, and fitness tracking.
- `routes`: Transit corridors, distance parameters, and stop sequence sub-documents.
- `studentpasses`: Anti-counterfeit QR pass records and validity timestamps.
- `feetransactions`: Payment ledger for UPI, Card, NetBanking, and offline bank challans.
- `emergencyevents`: SOS emergency broadcasts and incident status logs.

## Seed Files
- `seeds/001_initial_seeds.json`: Initial MongoDB document seeds for development and testing.
