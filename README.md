# DevSeed API

[![React](https://img.shields.io/badge/React-blue?logo=react&logoColor=white)](https://react.dev/) 
[![Node.js](https://img.shields.io/badge/Node.js-22.15-green?logo=node.js&logoColor=white)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

DevSeed API provides **realistic mock data APIs for frontend developers** — including users, e-commerce, and SaaS datasets — so you can build and test applications without a backend.

## Live Demo

Explore and test the API instantly:

👉 https://www.devseedapi.com/

Example: GET https://www.devseedapi.com/api/v1/ecommerce/products?limit=5

---

## Why DevSeed API?

Unlike generic mock APIs, DevSeed API offers:

- **Realistic data models** designed for real-world applications  
- **Relational data support** using `?include` queries  
- **Built-in API behavior simulation** (latency, errors, random failures)  
- **Domain-specific datasets** (E-Commerce, SaaS, Users)  

Perfect for building production-like frontend experiences without a backend.

---

## Features

- Domain-based datasets (Users, E-Commerce, SaaS)  
- Relational data support (`?include=reviews,category`)  
- Filtering, sorting, search, and pagination  
- API simulation:
  - `delay` → simulate network latency  
  - `error` → force HTTP errors  
  - `errorRate` → random failures  
- Versioned REST API (`/api/v1`)  
- Interactive API documentation with live console  
- Works seamlessly with React, Vue, Angular, and other frontend frameworks  

---

## Example
GET /api/v1/users

Example Response:

```json
[
  {
    "id": "u1",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "customer"
  }
]
```
For full API reference and interactive testing:

👉 https://www.devseedapi.com

---

### License
MIT © Indika Gayashan







