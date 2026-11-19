# DevSeed API

[![React](https://img.shields.io/badge/React-blue?logo=react&logoColor=white)](https://react.dev/) 
[![Node.js](https://img.shields.io/badge/Node.js-22.15-green?logo=node.js&logoColor=white)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

DevSeed API provides **realistic mock data APIs for frontend developers** — including users, e-commerce, and SaaS datasets — so you can build and test applications without a backend.

## Live Demo

Explore and test the API instantly:

👉 https://www.devseedapi.com/

Example: GET https://www.devseedapi.com/api/v1/ecommerce/products?limit=5

📘 Tutorial: [Mock an e-commerce backend for your React app in 5 minutes](https://dev.to/indika_gayashan_u/mock-an-e-commerce-backend-for-your-react-app-in-5-minutes-1e8c) (search, pagination, `include`, validation errors and loading/error states).

**Missing something? [Tell us](https://tally.so/r/Z9OMa0?page=README)**: which data pack you want next, a field or filter you need, or anything that's annoying. It takes under a minute.

---

## Why DevSeed API?

Unlike generic mock APIs, DevSeed API offers:

- **Realistic data models** designed for real-world applications  
- **Relational data support** using `?include` queries  
- **Simulated writes** (`POST`, `PUT`, `PATCH`, `DELETE`) with realistic responses and validation errors  
- **Built-in API behavior simulation** (latency, errors, random failures)  
- **Domain-specific datasets** (E-Commerce, SaaS, Users)  

Perfect for building production-like frontend experiences without a backend.

---

## Features

- Domain-based datasets (Users, E-Commerce, SaaS)  
- Relational data support (`?include=reviews,category`)  
- Filtering, sorting, search, and pagination  
- Get one record by id (`GET /api/v1/users/u1`)  
- Simulated writes: `POST`, `PUT`, `PATCH`, `DELETE` validate the body and return the record the write would produce (`201`, `422` with field errors, `404`), without saving anything  
- API simulation:
  - `delay` → simulate network latency  
  - `error` → force HTTP errors  
  - `errorRate` → random failures  
- Versioned REST API (`/api/v1`)  
- Interactive API documentation with live console  
- Works seamlessly with React, Vue, Angular, and other frontend frameworks  

---

## Example
GET /api/v1/users?limit=1

Example Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "u1",
      "name": {
        "first": "John",
        "last": "Doe"
      },
      "gender": "male",
      "email": "john@example.com",
      "role": "customer",
      "createdAt": "2026-01-01T10:00:00Z",
      "address": {
        "street": "742 Evergreen Terrace",
        "city": "Springfield",
        "state": "IL",
        "country": "US",
        "postcode": "62704"
      },
      "profile": {
        "avatar": "https://randomuser.me/api/portraits/men/1.jpg"
      }
    }
  ],
  "meta": { "total": 100, "page": 1, "limit": 1, "totalPages": 100 }
}
```

Simulated write:

```http
POST /api/v1/ecommerce/products
Content-Type: application/json

{ "name": "Desk Lamp", "price": 24.99, "categoryId": "c7" }
```

Returns `201 Created` with the new record (`id` and `createdAt` filled in). Invalid input returns `422` with an `errors` list. Nothing is saved.
For full API reference and interactive testing:

👉 https://www.devseedapi.com

---

### License
MIT © Indika Gayashan







