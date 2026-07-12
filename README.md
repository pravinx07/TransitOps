# 🚍 TransitOps — Smart Transport Operations Platform

> **Odoo Hackathon | 8 Hours | 3-Member Team**

A centralized platform that digitizes vehicle, driver, dispatch, maintenance, and expense management for logistics companies — replacing spreadsheets with real-time operational visibility.

---

## 🧑‍💻 Team & Branch Ownership

| Member | Branch | Vertical Slice |
|--------|--------|----------------|
| 🔵 **Member 1** | `feature/core-auth` | Setup · Auth · Vehicles · Dashboard |
| 🟢 **Member 2** | `feature/operations` | Drivers · Trips · Maintenance |
| 🟡 **Member 3** | `feature/finance-analytics` | Fuel · Expenses · Reports · Charts |

> Each member owns **backend + frontend** for their module — full-stack, visible contribution.

---

## ⚡ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js · Express.js · TypeScript |
| Database | PostgreSQL · Prisma ORM |
| Frontend | React.js · TailwindCSS · TypeScript |
| Auth | JWT (jsonwebtoken) · bcryptjs |
| State | React Query (TanStack) · React Context |
| Forms | React Hook Form · Zod |
| Charts | Recharts |
| HTTP | Axios |

---

## 🗂️ Project Structure

```
TransitOps/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       ├── index.ts                    ← App entry
│       ├── lib/prisma.ts               ← Prisma singleton
│       ├── middleware/
│       │   ├── auth.ts                 ← JWT verify
│       │   └── rbac.ts                 ← Role guard
│       ├── utils/
│       │   ├── apiResponse.ts          ← sendSuccess / sendError
│       │   └── csvExport.ts
│       └── modules/
│           ├── auth/                   ← 🔵 M1
│           ├── vehicles/               ← 🔵 M1
│           ├── drivers/                ← 🟢 M2
│           ├── trips/                  ← 🟢 M2
│           ├── maintenance/            ← 🟢 M2
│           ├── fuel/                   ← 🟡 M3
│           ├── expenses/               ← 🟡 M3
│           └── analytics/              ← 🟡 M3
└── frontend/
    └── src/
        ├── context/AuthContext.tsx     ← 🔵 M1
        ├── routes/                     ← 🔵 M1
        ├── services/api.ts             ← 🟡 M3
        ├── hooks/                      ← 🟡 M3
        ├── components/
        │   ├── layout/                 ← 🔵 M1
        │   ├── ui/                     ← 🔵 M1
        │   ├── drivers/                ← 🟢 M2
        │   ├── trips/                  ← 🟢 M2
        │   └── charts/                 ← 🟡 M3
        └── pages/
            ├── LoginPage.tsx           ← 🔵 M1
            ├── RegisterPage.tsx        ← 🔵 M1
            ├── DashboardPage.tsx       ← 🔵 M1
            ├── VehiclesPage.tsx        ← 🔵 M1
            ├── DriversPage.tsx         ← 🟢 M2
            ├── TripsPage.tsx           ← 🟢 M2
            ├── CreateTripPage.tsx      ← 🟢 M2
            ├── MaintenancePage.tsx     ← 🟢 M2
            ├── FuelPage.tsx            ← 🟡 M3
            ├── ExpensesPage.tsx        ← 🟡 M3
            └── ReportsPage.tsx         ← 🟡 M3
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL running locally
- Git

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_ORG/TransitOps.git
cd TransitOps
```

### 2. Create your branch

```bash
# Member 1
git checkout -b feature/core-auth

# Member 2
git checkout -b feature/operations

# Member 3
git checkout -b feature/finance-analytics
```

### 3. Backend Setup

```bash
cd backend
npm install
```

Create your `.env` file:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/transitops"
JWT_SECRET="transitops_super_secret_jwt_key"
PORT=3000
NODE_ENV=development
```

### 4. Run Database Migration

> ⚠️ **Member 1 does this first.** Everyone else pulls after it's done.

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Start Backend Dev Server

```bash
npm run dev
# Runs on http://localhost:3000
```

### 6. Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

Install required packages:

```bash
npm install @tanstack/react-query axios react-router-dom react-hook-form zod @hookform/resolvers recharts lucide-react react-hot-toast
```

### 7. Start Frontend Dev Server

```bash
npm run dev
# Runs on http://localhost:5173
```

---

## 🌿 Git Workflow

```bash
# Work on your branch
git add .
git commit -m "feat(vehicles): add CRUD API with status filters"
git push origin feature/YOUR-BRANCH

# At checkpoints, merge to main
git checkout main
git merge feature/core-auth
git push origin main
```

**Commit convention:**
```
feat(module): short description
fix(module): what was broken
chore: setup / config changes
```

---

## 🔌 API Reference

Base URL: `http://localhost:3000/api`

All protected routes require:
```
Authorization: Bearer <token>
```

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | ❌ | Register with role |
| POST | `/auth/login` | ❌ | Login, get JWT |
| GET | `/auth/me` | ✅ | Get current user |

### Vehicles
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/vehicles` | List all (filter: type, status, region) |
| POST | `/vehicles` | Create vehicle |
| GET | `/vehicles/:id` | Get by ID |
| PUT | `/vehicles/:id` | Update |
| DELETE | `/vehicles/:id` | Delete/Retire |
| GET | `/vehicles/available` | Only AVAILABLE vehicles |

### Drivers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/drivers` | List all drivers |
| POST | `/drivers` | Create driver |
| GET | `/drivers/:id` | Get by ID |
| PUT | `/drivers/:id` | Update |
| DELETE | `/drivers/:id` | Delete |
| GET | `/drivers/available` | AVAILABLE + valid license only |

### Trips
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/trips` | List all trips |
| POST | `/trips` | Create trip (DRAFT) |
| GET | `/trips/:id` | Get by ID |
| PUT | `/trips/:id` | Update |
| POST | `/trips/:id/dispatch` | DRAFT → DISPATCHED |
| POST | `/trips/:id/complete` | DISPATCHED → COMPLETED |
| POST | `/trips/:id/cancel` | DISPATCHED → CANCELLED |

### Maintenance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/maintenance` | List all logs |
| POST | `/maintenance` | Create log (vehicle → IN_SHOP) |
| GET | `/maintenance/:id` | Get by ID |
| PUT | `/maintenance/:id` | Update |
| POST | `/maintenance/:id/close` | Close log (vehicle → AVAILABLE) |

### Fuel Logs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/fuel` | List all fuel logs |
| POST | `/fuel` | Create fuel log |
| GET | `/fuel/vehicle/:vehicleId` | Per-vehicle logs |
| DELETE | `/fuel/:id` | Delete log |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/expenses` | List all expenses |
| POST | `/expenses` | Create expense |
| GET | `/expenses/vehicle/:vehicleId` | Per-vehicle expenses |
| DELETE | `/expenses/:id` | Delete expense |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics/dashboard` | All 7 dashboard KPIs |
| GET | `/analytics/fuel-efficiency` | Distance/Fuel per vehicle |
| GET | `/analytics/operational-cost` | Fuel + Maintenance cost |
| GET | `/analytics/fleet-utilization` | Utilization % |
| GET | `/analytics/vehicle-roi` | ROI per vehicle |
| GET | `/analytics/export/csv` | Download CSV report |

---

## 🔐 Roles

| Role | Key Access |
|------|-----------|
| `FLEET_MANAGER` | Full access: vehicles, drivers, maintenance |
| `DRIVER` | Create & manage trips |
| `SAFETY_OFFICER` | View drivers, license compliance |
| `FINANCIAL_ANALYST` | Fuel, expenses, reports |

---

## 🚦 Business Rules (Auto-enforced by backend)

1. ❌ Vehicle `registrationNumber` must be **unique**
2. ❌ Cannot dispatch `RETIRED`, `IN_SHOP`, or `ON_TRIP` vehicle
3. ❌ Cannot assign driver with **expired license** or `SUSPENDED` status
4. ❌ Cannot assign `ON_TRIP` driver to another trip
5. ❌ `cargoWeight` must not exceed vehicle `maxLoadCapacity`
6. ✅ **Dispatch** → vehicle & driver both flip to `ON_TRIP` (atomic transaction)
7. ✅ **Complete** → vehicle & driver both flip to `AVAILABLE`
8. ✅ **Cancel** → vehicle & driver both flip to `AVAILABLE`
9. ✅ **Create Maintenance** → vehicle flips to `IN_SHOP`
10. ✅ **Close Maintenance** → vehicle flips to `AVAILABLE` (unless `RETIRED`)

---

## 🔄 Core Platform Workflows

Here are the operational workflows that govern the state machine of our transport operations.

### 1. Trip Lifecycle Workflow
Trips move through a strict lifecycle from creation to resolution. The diagram below illustrates the states and the automatic transitions applied to associated `Vehicle` and `Driver` records.

```mermaid
stateDiagram-v2
    [*] --> DRAFT : Create Trip
    
    state "DRAFT (Draft)" as DRAFT
    state "DISPATCHED (On Trip)" as DISPATCHED
    state "COMPLETED (Available)" as COMPLETED
    state "CANCELLED (Available)" as CANCELLED

    DRAFT --> DISPATCHED : Dispatch Trip\n[Validates Capacity & Expiry]\n[Sets Vehicle & Driver to ON_TRIP]
    DRAFT --> CANCELLED : Cancel Draft
    
    DISPATCHED --> COMPLETED : Complete Trip\n[Enters Final Odometer & Fuel]\n[Sets Vehicle & Driver to AVAILABLE]
    DISPATCHED --> CANCELLED : Cancel Dispatched\n[Restores Vehicle & Driver to AVAILABLE]
```

### 2. Maintenance Work Order Workflow
Adding a vehicle to maintenance locks it from being scheduled or dispatched on any trip.

```mermaid
flowchart TD
    A[Start: Vehicle AVAILABLE] -->|Create Maintenance Log| B(Vehicle status flips to IN_SHOP)
    B -->|Excluded from Dispatch| C{Dispatch Try?}
    C -->|Yes| D[Block Dispatch: Vehicle In Shop]
    C -->|No| E[Maintenance Work Ongoing]
    E -->|Close Maintenance Log| F{Is Vehicle Retired?}
    F -->|Yes| G[Vehicle status flips to RETIRED]
    F -->|No| H[Vehicle status flips to AVAILABLE]
```

### 3. Expense & ROI Calculation Workflow
Financial and operational insights are compiled automatically as new trips, refuel logs, and expenses are logged.

```mermaid
flowchart LR
    A[Trip Revenue] --> ROI(Vehicle ROI Calculation)
    B[Fuel Logs Cost] --> ROI
    C[Maintenance Cost] --> ROI
    D[Other Expenses] --> ROI
    E[Acquisition Cost] --> ROI
    
    ROI -->|Formula| F["ROI = (Revenue - (Fuel + Maintenance + Other Expenses)) / Acquisition Cost"]
```

---


## 📊 Database Schema (Overview)

```
User          → id, name, email, password, role
Vehicle       → id, registrationNumber*, name, type, maxLoadCapacity, odometer, acquisitionCost, status, region
Driver        → id, name, licenseNumber*, licenseCategory, licenseExpiry, contactNumber, safetyScore, status
Trip          → id, source, destination, cargoWeight, plannedDistance, actualDistance, fuelConsumed, status, revenue
              → vehicleId (FK), driverId (FK)
MaintenanceLog → id, description, type, cost, status, startedAt, closedAt
              → vehicleId (FK)
FuelLog       → id, liters, cost, date, odometer
              → vehicleId (FK)
Expense       → id, category, amount, date, description
              → vehicleId (FK)
```

---

## ⏰ 8-Hour Timeline

```
Hour 0:00  Member 1: DB setup + schema migration + shared middleware
Hour 0:30  All members start their backend modules in parallel
Hour 3:00  ── BACKEND CHECKPOINT: All APIs tested in Postman ──
Hour 3:30  All members start their frontend pages
Hour 6:30  ── INTEGRATION CHECKPOINT: Frontend connected to Backend ──
Hour 7:00  Bug fixes, polish, CSV export, charts
Hour 8:00  ── DEMO READY ──
```

---

## 🏁 Demo Flow

1. Login as Fleet Manager → view Dashboard KPIs
2. Register **Van-05** (capacity 500 kg) → status = `Available`
3. Register driver **Alex** with valid license
4. Create trip with cargo = 450 kg → system validates ≤ 500 kg ✅
5. Dispatch → Van-05 and Alex flip to `On Trip`
6. Try assigning Alex again → **blocked** ❌
7. Complete trip → both flip back to `Available`
8. Create maintenance (Oil Change) → Van-05 → `In Shop`
9. Try dispatching Van-05 → **blocked** ❌
10. Close maintenance → Van-05 → `Available`
11. View **Reports** → fuel efficiency, ROI, cost charts

---

## 📦 Key Packages

### Backend
```bash
npm install express @prisma/client bcryptjs jsonwebtoken cors dotenv
npm install -D prisma typescript ts-node @types/node @types/express @types/bcryptjs @types/jsonwebtoken nodemon
```

### Frontend
```bash
npm install @tanstack/react-query axios react-router-dom react-hook-form zod @hookform/resolvers recharts lucide-react react-hot-toast
```

---

## 🤝 Integration Contracts

### Shared middleware (import in every route file):
```ts
import { authenticate } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";
import { sendSuccess, sendError } from "../../utils/apiResponse";
import { prisma } from "../../lib/prisma";
```

### Frontend Axios instance (Member 3 creates, everyone uses):
```ts
import api from "../services/api";
// api already has auth header injected via interceptor
const res = await api.get("/vehicles/available");
```

### Auth Context (Member 1 creates, everyone uses):
```ts
import { useAuth } from "../context/AuthContext";
const { user, token, role, logout } = useAuth();
```
