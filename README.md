# AssetFlow — Enterprise Asset & Resource Management ERP

AssetFlow is a production-grade, full-stack Enterprise Resource Planning (ERP) platform architected to manage, track, allocate, book, audit, and maintain corporate physical assets, workspaces, and high-value devices with mathematical constraint enforcement.

---

## 🛠️ Detailed Technology Stack

### Frontend (Client Portal)
- **Framework**: Next.js 16 (App Router) & React 19
- **State Engines**: 
  - `zustand` (Lightweight client-side persistent storage for session tokens, roles, and auth states)
  - `@tanstack/react-query` v5 (Declarative cache synchronization, invalidation keys, and async query mutations)
- **Styling & CSS System**: Tailwind CSS v4 featuring premium variables, fine-line layout grids, ambient glows, and light-theme card designs
- **Form Controls & Schema Guard**: React Hook Form with `@hookform/resolvers` wrapping `zod` schema constraints
- **UI Components**: Base UI & Lucide Icons
- **Analytics & Timelines**: Recharts (for allocation timeline grids and capacity metrics)

### Backend (REST Engine)
- **Core Server**: Node.js & Express (configured for Express 5 compatibility, resolving deprecated path-to-regexp wildcards)
- **Database Handler**: Prisma ORM with PostgreSQL hosted on Neon Serverless (SSL-secured connection pooling)
- **Security Middlewares**:
  - `helmet`: Enhances HTTP security headers (CSP, X-Frame-Options, HSTS, etc.)
  - `express-rate-limit`: Prevents brute force attacks by limiting client IP requests (default: 100 requests per 15 minutes)
  - `cors`: Handles origins and CORS credential headers
  - `bcryptjs`: Password hashing (rounds: 10)
  - `jsonwebtoken` (JWT): Signed secure authorization headers

---

## 🗄️ Comprehensive Folder Structure

### Backend Layout
```text
backend/
├── prisma/
│   ├── schema.prisma   # PostgreSQL tables, relations, and enums definitions
│   └── seed.ts         # Complete seed dataset loader for testing environment
├── src/
│   ├── config/
│   │   ├── constants.ts # Global constants (API prefix, pagination limits)
│   │   └── env.ts      # Env validations (JWT keys, Frontend urls)
│   ├── controllers/    # Route controllers handling inputs & response formatting
│   ├── middleware/     # Auth checks, Role-based guard, CORS preflights, error handler
│   ├── routes/         # Express endpoint route mapping groups
│   ├── services/       # Core business logic handlers and Prisma query execution
│   ├── utils/          # Formatting response templates, logger utility
│   └── index.ts        # Express setup, middleware chains, and port bindings
```

### Frontend Layout
```text
frontend/
├── src/
│   ├── app/            # Next.js App Router routes & layouts
│   ├── components/     # Global layout headers, sidebars, alerts, skeletons, cards
│   ├── features/       # Scoped feature packages containing hooks, components, services
│   │   ├── allocation/
│   │   ├── assets/
│   │   ├── audit/
│   │   ├── auth/
│   │   ├── booking/
│   │   ├── dashboard/
│   │   ├── maintenance/
│   │   └── organization/
│   ├── hooks/          # Global generic React hooks
│   ├── lib/            # Axios API config, instance setup, interceptors
│   ├── store/          # Zustand global stores (Auth store)
│   └── utils/          # Formatting helpers (currencies, serials, names)
```

---

## 🏗️ Detailed Database Models & Relations

AssetFlow runs on a highly relation-backed relational database schema:

```mermaid
erDiagram
    User ||--o| Department : member
    Department ||--o| User : head
    Asset }|--|| AssetCategory : categorised
    Asset }|--o| Department : owned
    Allocation }|--|| Asset : references
    Allocation }|--|| User : allocated-to
    ResourceBooking }|--|| Asset : booked-resource
    ResourceBooking }|--|| User : booked-by
    MaintenanceRequest }|--|| Asset : maintenance-target
    MaintenanceRequest }|--|| User : raised-by
    AuditEntry }|--|| AuditCycle : cycle-group
    AuditEntry }|--|| Asset : audited-asset
```

### Key Models Description
1. **User**: Represents corporate staff. Roles define system capabilities (`ADMIN`, `ASSET_MANAGER`, `DEPARTMENT_HEAD`, `EMPLOYEE`).
2. **Department**: Scoped grouping for organizational structure. Includes a reference to a `User` (Department Head) who authorizes asset transfers.
3. **AssetCategory**: Categories like "Laptops" or "Meeting Rooms". Supports **dynamic custom fields** stored as JSON.
4. **Asset**: High-value devices or rooms. Tracks condition, status (`AVAILABLE`, `ALLOCATED`, `UNDER_MAINTENANCE`, `LOST`, `RETIRED`, `DISPOSED`), location, and bookability.
5. **Allocation**: Tracks asset checkout, return date, overdue markers, and return condition.
6. **ResourceBooking**: Meeting room reservations preventing double-booking overlaps.
7. **MaintenanceRequest**: Tracks defect report lifecycles from raised state to technician resolution.
8. **AuditCycle & AuditEntry**: Governs verification campaigns to trace physical locations of assets.

---

## 🔐 Role-Based Access Control (RBAC) Matrix

| Feature | Admin | Asset Manager | Department Head | Employee |
|---|:---:|:---:|:---:|:---:|
| **Register New Asset / Category** | ✅ | ✅ | ❌ | ❌ |
| **Allocate Asset to Employee** | ✅ | ✅ | ❌ | ❌ |
| **Approve Peer Transfer Requests**| ✅ | ❌ | ✅ | ❌ |
| **Book Workspace / Room** | ✅ | ✅ | ✅ | ✅ |
| **Raise Maintenance Request** | ✅ | ✅ | ✅ | ✅ |
| **Resolve Maintenance Request** | ✅ | ✅ | ❌ | ❌ |
| **Run Audit Campaigns** | ✅ | ✅ | ❌ | ❌ |
| **View Scoped User Activity** | Scoped | Scoped | Dept Scope | Own Scope |

---

## 🚀 Setup & Launch Checklist

### 1. Environment Configuration

#### Backend (`backend/.env`)
Create a `.env` file in the `backend` folder. Note that port `5001` prevents conflicts with macOS Control Center/AirPlay listening on `5000`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/assetflow"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
PORT=5001
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

#### Frontend (`frontend/.env`)
Create a `.env` file in the `frontend` folder pointing to the port `5001` backend:
```env
NEXT_PUBLIC_API_URL="http://localhost:5001/api/v1"
```

### 2. Install & Seed Database
```bash
# In backend directory
npm install
npx prisma generate
npx prisma db seed
```
This loads a comprehensive dataset of 3 departments, 16 users, 20 assets, allocations, bookings, maintenance requests, and active audits.

### 3. Launch Development Servers

#### Backend
```bash
# In backend directory
npm run dev
# Running on http://localhost:5001
```

#### Frontend
```bash
# In frontend directory
npm install
npm run dev
# Running on http://localhost:3000
```

---

## 🔑 Demo Logins (All passwords: `Password@123`)
* **Admin**: `admin@assetflow.com`
* **Asset Manager**: `anjali.manager@assetflow.com`
* **Department Head**: `priya.head@assetflow.com`
* **Employee**: `raj@assetflow.com`

---

## 🔍 Detailed Code Mechanics & Business Logic

### Double Allocation Blocker
Implemented in `backend/src/services/allocation.service.ts`:
- When an asset checkout is requested, the system verifies if the asset is currently marked as `AVAILABLE`.
- If another active allocation exists, it rejects the request with a `409 Conflict` status, and provides the frontend with information about the current holder and options to trigger a Peer Transfer.

### Booking Boundary Validator
Implemented in `backend/src/services/booking.service.ts`:
- Rejects booking times that overlap with existing bookings on the same resource.
- Allows bookings where the end time matches the start time of the next booking (e.g. `10:00` end and `10:00` start are allowed with exact touch boundaries).

### Dynamic Custom Fields
Implemented in `frontend/src/features/assets/components/RegisterAssetModal.tsx`:
- When a user selects a category (e.g., Laptops), the app parses the category's `customFields` JSON schema from the database.
- Dynamically renders matching form inputs (e.g., input fields for `warrantyPeriod`, `RAM`, `ports`) and saves them inside the asset's database row.
