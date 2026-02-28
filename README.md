# DevSeed API

A modular, industry-agnostic RESTful API for developers to test frontend apps, with an optional React SPA landing page. Built with **Node.js, Express, TypeScript, and MongoDB (optional)**.  

It currently serves static JSON data and can later support CRUD operations with a database.  

---

## Table of Contents

- [Features](#features)  
- [Folder Structure](#folder-structure)  
- [Getting Started](#getting-started)  
- [Available Scripts](#available-scripts)  
- [API Endpoints](#api-endpoints)  
- [Frontend](#frontend)  
- [License](#license)  

---

## Features

- Modular architecture with domain-specific “packs” (e.g., `core/users`, `packs/ecommerce`)  
- JSON-based mock data for rapid prototyping  
- API versioning: `/api/v1`  
- SPA landing page built with React + Vite + Tailwind  
- Supports middleware for errors and 404 handling  
- Easy to extend with MongoDB or other databases in the future  

---

## Folder Structure

```text
src/
  api/
    core/
      controllers/
      routes/
      services/
      data/
    packs/
      ecommerce/
        controllers/
        routes/
        services/
        data/
    shared/
      middleware/
      utils/
  frontend/      # React SPA project (Vite + TypeScript + Tailwind)
  app.ts         # Express app
  server.ts      # Entry point
```
---

## Getting Started

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x

### Install Dependencies
```
# From project root
- npm install

# Install frontend dependencies
- cd src/frontend
- npm install
```
### Build Frontend
```
cd src/frontend
npm run build
```
### Run in Development Mode
```
# From project root
npm run dev
```
- API: http://localhost:4000/api/v1/*
- SPA: http://localhost:4000/

### Run Production Mode
```
# Compile backend + build frontend
npm run build

# Start server
npm start
```
---

## Available Scripts
```
"scripts": {
  "dev": "nodemon --watch src --ext ts,tsx --exec ts-node src/server.ts",
  "build:frontend": "cd src/frontend && npm install && npm run build",
  "build": "tsc && npm run build:frontend",
  "start": "node dist/server.js"
}
```
- dev → Start backend in dev mode with auto-reload
- build:frontend → Build React SPA
- build → Compile backend + build frontend
- start → Run compiled backend

---
## API Endpoints
### Core Users
- GET /api/v1/users → Fetch all users

Example Response:
```
[
  {
    "id": "u1",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "customer",
    "createdAt": "2026-01-01T10:00:00Z"
  },
  {
    "id": "u2",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "role": "admin",
    "createdAt": "2026-01-02T10:00:00Z"
  }
]
```
Additional endpoints (POST, PUT, PATCH) will be added in future versions.

---

## Frontend
- React + Vite + TypeScript + Tailwind
- Landing page available at /
- Can fetch API data dynamically using /api/v1 endpoints

---

### License
MIT © Indika Gayashan







