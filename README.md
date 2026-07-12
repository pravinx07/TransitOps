# 🚍 TransitOps — Smart Transport Operations Platform

A centralized platform that digitizes vehicle, driver, dispatch, maintenance, and expense management for logistics companies — replacing spreadsheets with real-time operational visibility.

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
| Analytics | Recharts / Custom CSS Charts |

---

## 🌟 Key Features

* **Role-Based Access Control (RBAC):** Separate access for Fleet Managers, Drivers, Safety Officers, and Financial Analysts.
* **Vehicle & Driver Registry:** Complete CRUD management with status tracking, capacity checks, and license validation.
* **Trip Dispatcher:** Create trips with robust validations (cargo weight vs capacity, license expiry checks).
* **Live Board:** Monitor active trips and automatically update vehicle/driver statuses during dispatch, completion, and cancellation.
* **Maintenance Workflows:** Log vehicle maintenance to automatically pull them from the active fleet (`IN_SHOP`).
* **Reports & Analytics:** Track fuel efficiency, fleet utilization, and operational costs with CSV export functionality.

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL running locally

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_ORG/TransitOps.git
cd TransitOps
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create your `.env` file in the `backend` folder:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/transitops"
JWT_SECRET="transitops_super_secret_jwt_key"
PORT=3000
```
Sync your database and seed it with mock data:
```bash
npx prisma db push
npx prisma db seed
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```
Create your `.env` file in the `frontend` folder:
```env
VITE_API_URL=http://localhost:3000/api
```
Start Frontend Dev Server:
```bash
npm run dev
```

---

## 🔑 Default Credentials

If you ran the database seeder, you can log in with any of the following accounts (The password for all accounts is **`password123`**):

- **Fleet Manager**: `manager@transitops.com`
- **Driver**: `driver@transitops.com`
- **Safety Officer**: `safety@transitops.com`
- **Financial Analyst**: `finance@transitops.com`

---

## 🚦 Business Rules (Auto-enforced)

1. ❌ Vehicle `registrationNumber` and `plateNumber` must be **unique**
2. ❌ Cannot dispatch `RETIRED`, `IN_SHOP`, `IN_MAINTENANCE` or `ON_TRIP` vehicles
3. ❌ Cannot assign a driver with an **expired license** or `SUSPENDED` status
4. ❌ Cannot assign an `ON_TRIP` driver to another trip
5. ❌ `cargoWeight` must not exceed vehicle's maximum load capacity
6. ✅ **Dispatch** → vehicle & driver both flip to `ON_TRIP`
7. ✅ **Complete** → vehicle & driver both flip back to `AVAILABLE`
8. ✅ **Cancel** → vehicle & driver both flip back to `AVAILABLE`
9. ✅ **Create Maintenance** → vehicle flips to `IN_MAINTENANCE`
10. ✅ **Complete Maintenance** → vehicle flips back to `AVAILABLE`

---

## 🔄 Core Platform Workflows

### 1. Trip Lifecycle
```mermaid
stateDiagram-v2
    [*] --> DRAFT : Create Trip
    
    state "DRAFT" as DRAFT
    state "DISPATCHED (On Trip)" as DISPATCHED
    state "COMPLETED (Available)" as COMPLETED
    state "CANCELLED (Available)" as CANCELLED

    DRAFT --> DISPATCHED : Dispatch Trip\n[Validates Capacity & Expiry]
    DRAFT --> CANCELLED : Cancel Draft
    
    DISPATCHED --> COMPLETED : Complete Trip\n[Sets Vehicle & Driver to AVAILABLE]
    DISPATCHED --> CANCELLED : Cancel Dispatched
```

### 2. Maintenance Work Order
```mermaid
flowchart TD
    A[Start: Vehicle AVAILABLE] -->|Create Maintenance Log| B(Vehicle status flips to IN_MAINTENANCE)
    B -->|Excluded from Dispatch| C{Dispatch Try?}
    C -->|Yes| D[Block Dispatch]
    C -->|No| E[Maintenance Work Ongoing]
    E -->|Complete Maintenance| H[Vehicle status flips to AVAILABLE]
```
