# Lead Management System

A mini Lead Management System built with **Node.js, Express, Sequelize, MySQL** on the backend and **Next.js (App Router) + TypeScript + MUI** on the frontend.

---

## 1. Setup Instructions

Run this to migrate Database table

run -> npm run seed

then to run server 

run -> node server.js 

### Prerequisites
- Node.js ≥ 18
- MySQL ≥ 8
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
```

Create database:
```sql
CREATE DATABASE lead_management_system;
```

```bash
cp .env.example .env
npm run migrate
npm run dev
```

Backend runs on `http://localhost:5000`

---

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Frontend runs on `http://localhost:3000`

---

## 2. Database Schema / Migrations

### Users
- id (PK)
- name
- email
- password
- timestamps (with soft delete)

### Leads
- id (PK)
- name
- email
- phone
- source
- status
- assigned_to (FK → users)
- timestamps

### Lead Activities
- id (PK)
- lead_id (FK)
- activity_type
- description
- created_by (FK → users)
- timestamps

---

## 3. API Documentation

### Create Lead
**POST** `/api/leads`

### Get Leads
**GET** `/api/leads`

Supports filters:
- status
- source
- assigned_to
- pagination

### Update Lead Status
**PUT** `/api/leads/:id/status`

### Lead Timeline
**GET** `/api/leads/:id/timeline`

---

## 4. Assumptions

- Phone numbers are Indian (10 digits)
- Gmail dot normalization supported
- Simple authentication assumed
- Controlled lead status transitions

---

## 5. Known Limitations

- No RBAC
- No caching layer
- No real-time updates
- Duplicate detection is heuristic-based

---

## 6. Environment Variables

### Backend `.env.example`
```env
BASE_URL=http://localhost:3005
DB_HOST=localhost
DB_PORT=3306
DB_NAME=lead_management_system
DB_USER=root
DB_PASS=
JWT_SECRET=e0bc8f09599c21225cf355d00acadf26982710765a3382435ccbb93e72b548e120c7cf67b431fd73f73f6d26640fcb12c20ed2e9b87b1064568d44a0f882e2f7
PORT=3005
```

### Frontend `.env.example`
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3005/api
```

---

## Notes
This project is designed for interview and assessment purposes, demonstrating scalable architecture, clean code, and real-world workflows.
