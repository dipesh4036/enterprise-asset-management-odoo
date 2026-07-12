# AssetFlow — Enterprise Asset & Resource Management System

> Odoo Hackathon | PERN Stack | Production-Quality ERP

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Folder Structure](#3-folder-structure)
4. [Database Schema](#4-database-schema)
5. [Asset Lifecycle State Machine](#5-asset-lifecycle-state-machine)
6. [Role-Based Access Control](#6-role-based-access-control)
7. [API Design](#7-api-design)
8. [Implementation Phases](#8-implementation-phases)
9. [Screen-by-Screen Build Plan](#9-screen-by-screen-build-plan)
10. [Team Task Allocation — Dipesh / Utsave / Maulik](#10-team-task-allocation--dipesh--utsave--maulik)
11. [Environment Setup](#11-environment-setup)
12. [Git Strategy](#12-git-strategy)
13. [Definition of Done](#13-definition-of-done)

---

## 1. Project Overview

AssetFlow digitizes how organizations track, allocate, and maintain physical assets and shared resources. It replaces spreadsheets and paper logs with structured lifecycle management, role-based workflows, and real-time visibility.

**10 Core Modules:**

| # | Module | Purpose |
|---|--------|---------|
| 1 | Auth | Login / Signup with non-self-elevating roles |
| 2 | Dashboard | KPI snapshot per role |
| 3 | Organization Setup | Departments, categories, employee directory (Admin only) |
| 4 | Asset Registry | Register, track, search assets with full lifecycle |
| 5 | Allocation & Transfer | Who holds what — conflict-blocked, history-tracked |
| 6 | Resource Booking | Time-slot booking with overlap validation |
| 7 | Maintenance | Approval workflow before repair starts |
| 8 | Audit | Structured cycles with auto-discrepancy reports |
| 9 | Reports & Analytics | Utilization, frequency, heatmap, exportable |
| 10 | Notifications & Logs | Real-time alerts + full audit trail |

---

## 2. Tech Stack

### Frontend
```
Framework     : Next.js 14+ (App Router, Client-Side focus)
Language      : TypeScript (strict mode)
Styling       : Tailwind CSS + shadcn/ui
Data Fetching : TanStack Query v5 (React Query)
Forms         : React Hook Form
Validation    : Zod
State         : Zustand (global client state)
HTTP Client   : Axios (configured instance)
Icons         : Lucide React
Notifications : Sonner (toast)
Charts        : Recharts
```

### Backend
```
Runtime       : Node.js
Framework     : Express.js
Language      : TypeScript (strict mode)
Database      : PostgreSQL
ORM           : Prisma ORM
Auth          : JWT (access token + refresh token)
Validation    : Zod
Password Hash : bcryptjs
```

### Dev & Infra
```
Package Mgr   : npm workspaces (monorepo)
Linting       : ESLint + Prettier
Git Hooks     : Husky + lint-staged
Env           : dotenv
```

---

## 3. Folder Structure

```
assetflow/
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── app/
│       │   ├── (auth)/
│       │   │   ├── login/page.tsx
│       │   │   └── signup/page.tsx
│       │   └── (dashboard)/
│       │       ├── layout.tsx                  ← Sidebar + Navbar shell
│       │       ├── dashboard/page.tsx
│       │       ├── organization/page.tsx        ← Screen 3 (Admin only)
│       │       ├── assets/
│       │       │   ├── page.tsx                ← Asset Directory
│       │       │   └── [id]/page.tsx           ← Asset Detail
│       │       ├── allocation/page.tsx
│       │       ├── booking/page.tsx
│       │       ├── maintenance/page.tsx
│       │       ├── audit/page.tsx
│       │       ├── reports/page.tsx
│       │       └── notifications/page.tsx
│       ├── components/
│       │   ├── ui/                             ← shadcn components
│       │   ├── layout/
│       │   │   ├── Sidebar.tsx
│       │   │   ├── Navbar.tsx
│       │   │   └── RoleGuard.tsx
│       │   └── common/
│       │       ├── EmptyState.tsx
│       │       ├── LoadingSkeleton.tsx
│       │       ├── ConfirmDialog.tsx
│       │       ├── StatusBadge.tsx
│       │       └── DataTable.tsx
│       ├── features/
│       │   ├── auth/
│       │   │   ├── components/LoginForm.tsx
│       │   │   ├── components/SignupForm.tsx
│       │   │   ├── hooks/useAuth.ts
│       │   │   ├── services/auth.service.ts
│       │   │   └── schema.ts
│       │   ├── dashboard/
│       │   │   ├── components/KPICard.tsx
│       │   │   ├── components/RecentActivity.tsx
│       │   │   ├── hooks/useDashboard.ts
│       │   │   └── services/dashboard.service.ts
│       │   ├── organization/
│       │   ├── assets/
│       │   ├── allocation/
│       │   ├── booking/
│       │   ├── maintenance/
│       │   ├── audit/
│       │   ├── reports/
│       │   └── notifications/
│       ├── hooks/
│       │   ├── useDebounce.ts
│       │   └── useLocalStorage.ts
│       ├── lib/
│       │   └── axios.ts                        ← Axios instance with interceptors
│       ├── providers/
│       │   ├── QueryProvider.tsx
│       │   └── AuthProvider.tsx
│       ├── store/
│       │   └── auth.store.ts                   ← Zustand auth store
│       ├── types/
│       │   └── index.ts
│       └── utils/
│           ├── cn.ts
│           ├── date.ts
│           └── format.ts
│
└── backend/
    ├── prisma/
    │   ├── schema.prisma
    │   └── seed.ts
    └── src/
        ├── config/
        │   ├── env.ts
        │   └── database.ts
        ├── controllers/
        │   ├── auth.controller.ts
        │   ├── dashboard.controller.ts
        │   ├── organization.controller.ts
        │   ├── asset.controller.ts
        │   ├── allocation.controller.ts
        │   ├── booking.controller.ts
        │   ├── maintenance.controller.ts
        │   ├── audit.controller.ts
        │   ├── report.controller.ts
        │   └── notification.controller.ts
        ├── middleware/
        │   ├── auth.middleware.ts              ← JWT verify
        │   ├── role.middleware.ts              ← RBAC guard
        │   ├── validate.middleware.ts          ← Zod request validation
        │   └── error.middleware.ts             ← Central error handler
        ├── routes/
        │   ├── index.ts
        │   ├── auth.routes.ts
        │   ├── dashboard.routes.ts
        │   ├── organization.routes.ts
        │   ├── asset.routes.ts
        │   ├── allocation.routes.ts
        │   ├── booking.routes.ts
        │   ├── maintenance.routes.ts
        │   ├── audit.routes.ts
        │   ├── report.routes.ts
        │   └── notification.routes.ts
        ├── services/
        │   ├── auth.service.ts
        │   ├── dashboard.service.ts
        │   ├── organization.service.ts
        │   ├── asset.service.ts
        │   ├── allocation.service.ts
        │   ├── booking.service.ts
        │   ├── maintenance.service.ts
        │   ├── audit.service.ts
        │   ├── report.service.ts
        │   └── notification.service.ts
        ├── validators/
        │   ├── auth.validator.ts
        │   ├── asset.validator.ts
        │   ├── allocation.validator.ts
        │   ├── booking.validator.ts
        │   ├── maintenance.validator.ts
        │   └── audit.validator.ts
        ├── utils/
        │   ├── logger.ts
        │   ├── assetTag.ts                     ← Auto-generate AF-0001
        │   ├── jwt.ts
        │   └── response.ts                     ← Consistent API response
        └── index.ts
```

---

## 4. Database Schema

### Prisma Models

```prisma
// schema.prisma

enum Role {
  ADMIN
  ASSET_MANAGER
  DEPARTMENT_HEAD
  EMPLOYEE
}

enum UserStatus {
  ACTIVE
  INACTIVE
}

enum AssetStatus {
  AVAILABLE
  ALLOCATED
  RESERVED
  UNDER_MAINTENANCE
  LOST
  RETIRED
  DISPOSED
}

enum AllocationStatus {
  ACTIVE
  RETURNED
  OVERDUE
}

enum TransferStatus {
  REQUESTED
  APPROVED
  REJECTED
}

enum BookingStatus {
  UPCOMING
  ONGOING
  COMPLETED
  CANCELLED
}

enum MaintenanceStatus {
  PENDING
  APPROVED
  REJECTED
  TECHNICIAN_ASSIGNED
  IN_PROGRESS
  RESOLVED
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum AuditCycleStatus {
  OPEN
  CLOSED
}

enum AuditEntryStatus {
  PENDING
  VERIFIED
  MISSING
  DAMAGED
}

// ─── USERS & ROLES ─────────────────────────────────────────

model User {
  id           String     @id @default(cuid())
  name         String
  email        String     @unique
  password     String
  role         Role       @default(EMPLOYEE)
  status       UserStatus @default(ACTIVE)
  departmentId String?
  department   Department? @relation("DeptEmployees", fields: [departmentId], references: [id])
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  // Relations
  headOfDepartments   Department[]         @relation("DeptHead")
  allocations         Allocation[]         @relation("AllocatedTo")
  transfersFrom       TransferRequest[]    @relation("TransferFrom")
  transfersTo         TransferRequest[]    @relation("TransferTo")
  bookings            ResourceBooking[]
  maintenanceRaised   MaintenanceRequest[] @relation("RaisedBy")
  maintenanceAssigned MaintenanceRequest[] @relation("Technician")
  auditAssignments    AuditAssignment[]
  notifications       Notification[]
  activityLogs        ActivityLog[]
}

// ─── ORGANIZATION ───────────────────────────────────────────

model Department {
  id               String     @id @default(cuid())
  name             String
  headId           String?
  head             User?      @relation("DeptHead", fields: [headId], references: [id])
  parentId         String?
  parent           Department? @relation("SubDept", fields: [parentId], references: [id])
  subDepartments   Department[] @relation("SubDept")
  status           UserStatus @default(ACTIVE)
  createdAt        DateTime   @default(now())
  updatedAt        DateTime   @updatedAt

  employees        User[]     @relation("DeptEmployees")
  assets           Asset[]
  auditCycles      AuditCycle[]
}

model AssetCategory {
  id           String   @id @default(cuid())
  name         String   @unique
  customFields Json?    // e.g. { "warrantyPeriod": "months" }
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  assets       Asset[]
}

// ─── ASSETS ─────────────────────────────────────────────────

model Asset {
  id              String      @id @default(cuid())
  assetTag        String      @unique  // AF-0001, auto-generated
  name            String
  categoryId      String
  category        AssetCategory @relation(fields: [categoryId], references: [id])
  serialNumber    String?     @unique
  acquisitionDate DateTime?
  acquisitionCost Decimal?    @db.Decimal(12, 2)
  condition       String      // Good, Fair, Poor
  location        String
  departmentId    String?
  department      Department? @relation(fields: [departmentId], references: [id])
  isBookable      Boolean     @default(false)
  status          AssetStatus @default(AVAILABLE)
  photoUrl        String?
  documentUrl     String?
  customFields    Json?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  allocations          Allocation[]
  transferRequests     TransferRequest[]
  bookings             ResourceBooking[]
  maintenanceRequests  MaintenanceRequest[]
  auditEntries         AuditEntry[]

  @@index([status])
  @@index([categoryId])
  @@index([departmentId])
}

// ─── ALLOCATION & TRANSFER ───────────────────────────────────

model Allocation {
  id               String           @id @default(cuid())
  assetId          String
  asset            Asset            @relation(fields: [assetId], references: [id])
  employeeId       String
  employee         User             @relation("AllocatedTo", fields: [employeeId], references: [id])
  status           AllocationStatus @default(ACTIVE)
  allocatedAt      DateTime         @default(now())
  expectedReturnAt DateTime?
  returnedAt       DateTime?
  conditionNotes   String?
  isOverdue        Boolean          @default(false)
  createdAt        DateTime         @default(now())

  @@index([assetId])
  @@index([employeeId])
  @@index([status])
}

model TransferRequest {
  id           String         @id @default(cuid())
  assetId      String
  asset        Asset          @relation(fields: [assetId], references: [id])
  fromUserId   String
  fromUser     User           @relation("TransferFrom", fields: [fromUserId], references: [id])
  toUserId     String
  toUser       User           @relation("TransferTo", fields: [toUserId], references: [id])
  status       TransferStatus @default(REQUESTED)
  reason       String?
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
}

// ─── RESOURCE BOOKING ────────────────────────────────────────

model ResourceBooking {
  id        String        @id @default(cuid())
  assetId   String
  asset     Asset         @relation(fields: [assetId], references: [id])
  userId    String
  user      User          @relation(fields: [userId], references: [id])
  startTime DateTime
  endTime   DateTime
  status    BookingStatus @default(UPCOMING)
  notes     String?
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt

  @@index([assetId])
  @@index([startTime, endTime])
}

// ─── MAINTENANCE ─────────────────────────────────────────────

model MaintenanceRequest {
  id           String            @id @default(cuid())
  assetId      String
  asset        Asset             @relation(fields: [assetId], references: [id])
  raisedById   String
  raisedBy     User              @relation("RaisedBy", fields: [raisedById], references: [id])
  issue        String
  priority     Priority          @default(MEDIUM)
  photoUrl     String?
  status       MaintenanceStatus @default(PENDING)
  technicianId String?
  technician   User?             @relation("Technician", fields: [technicianId], references: [id])
  resolvedAt   DateTime?
  notes        String?
  createdAt    DateTime          @default(now())
  updatedAt    DateTime          @updatedAt

  @@index([assetId])
  @@index([status])
}

// ─── AUDIT ───────────────────────────────────────────────────

model AuditCycle {
  id           String           @id @default(cuid())
  name         String
  departmentId String?
  department   Department?      @relation(fields: [departmentId], references: [id])
  location     String?
  startDate    DateTime
  endDate      DateTime
  status       AuditCycleStatus @default(OPEN)
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt

  assignments  AuditAssignment[]
  entries      AuditEntry[]
}

model AuditAssignment {
  id           String     @id @default(cuid())
  auditCycleId String
  auditCycle   AuditCycle @relation(fields: [auditCycleId], references: [id])
  auditorId    String
  auditor      User       @relation(fields: [auditorId], references: [id])
}

model AuditEntry {
  id           String           @id @default(cuid())
  auditCycleId String
  auditCycle   AuditCycle       @relation(fields: [auditCycleId], references: [id])
  assetId      String
  asset        Asset            @relation(fields: [assetId], references: [id])
  status       AuditEntryStatus @default(PENDING)
  notes        String?
  verifiedAt   DateTime?
}

// ─── NOTIFICATIONS & LOGS ─────────────────────────────────────

model Notification {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  type      String   // ASSET_ASSIGNED, BOOKING_CONFIRMED, OVERDUE_RETURN, etc.
  message   String
  isRead    Boolean  @default(false)
  entityId  String?  // ID of related entity
  createdAt DateTime @default(now())

  @@index([userId, isRead])
}

model ActivityLog {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  action     String   // ASSET_ALLOCATED, BOOKING_CREATED, etc.
  entityType String   // Asset, Booking, Maintenance, etc.
  entityId   String
  metadata   Json?
  createdAt  DateTime @default(now())

  @@index([entityType, entityId])
  @@index([userId])
}
```

---

## 5. Asset Lifecycle State Machine

```
                    ┌─────────────────────────────┐
                    │                             │
         ┌──────────▼──────────┐                 │
    ┌───►│     AVAILABLE       │◄────────────────┤
    │    └──────────┬──────────┘    (returned)   │
    │               │                             │
    │      allocate │        mark bookable        │
    │               │                             │
    │    ┌──────────▼──────────┐   ┌─────────────┴──────┐
    │    │     ALLOCATED       │   │     RESERVED        │
    │    └──────────┬──────────┘   └─────────────┬──────┘
    │               │  raise maintenance req            │
    │               │  (approved)              booking ends
    │    ┌──────────▼──────────┐                   │
    │    │  UNDER MAINTENANCE  │◄──────────────────┘
    │    └──────────┬──────────┘
    │               │ resolved
    └───────────────┘

    AVAILABLE → LOST       (audit: confirmed missing)
    ANY STATE → RETIRED    (admin decision)
    ANY STATE → DISPOSED   (admin decision)
```

---

## 6. Role-Based Access Control

| Feature | Admin | Asset Manager | Dept Head | Employee |
|---------|-------|---------------|-----------|---------|
| Organization Setup (Depts, Categories) | ✅ | ❌ | ❌ | ❌ |
| Promote Roles | ✅ | ❌ | ❌ | ❌ |
| Register Asset | ✅ | ✅ | ❌ | ❌ |
| Allocate Asset | ✅ | ✅ | ❌ | ❌ |
| Approve Transfer | ✅ | ✅ | ✅ | ❌ |
| Initiate Transfer/Return | ✅ | ✅ | ✅ | ✅ |
| Book Resource | ✅ | ✅ | ✅ | ✅ |
| Raise Maintenance | ✅ | ✅ | ✅ | ✅ |
| Approve Maintenance | ✅ | ✅ | ❌ | ❌ |
| Create Audit Cycle | ✅ | ❌ | ❌ | ❌ |
| Conduct Audit | ✅ | ✅ | ✅ | ❌ |
| View Reports | ✅ | ✅ | ✅ (dept) | ❌ |
| View All Notifications | ✅ | ✅ | ✅ | ✅ (own) |

---

## 7. API Design

All responses follow this structure:
```json
{
  "success": true,
  "message": "Asset allocated successfully",
  "data": { ... },
  "errors": null,
  "timestamp": "2026-07-12T10:00:00.000Z"
}
```

### Auth Routes
```
POST   /api/v1/auth/signup              → Create employee account
POST   /api/v1/auth/login               → Login, returns JWT
POST   /api/v1/auth/logout
GET    /api/v1/auth/me                  → Current user
```

### Dashboard
```
GET    /api/v1/dashboard/kpis           → KPI cards data
GET    /api/v1/dashboard/recent-activity
```

### Organization (Admin only)
```
GET    /api/v1/departments
POST   /api/v1/departments
PUT    /api/v1/departments/:id
PATCH  /api/v1/departments/:id/status

GET    /api/v1/categories
POST   /api/v1/categories
PUT    /api/v1/categories/:id

GET    /api/v1/employees
PATCH  /api/v1/employees/:id/role       → Promote role
PATCH  /api/v1/employees/:id/status
```

### Assets
```
GET    /api/v1/assets                   → Search, filter, paginate
POST   /api/v1/assets                   → Register asset
GET    /api/v1/assets/:id               → Detail + history
PUT    /api/v1/assets/:id
GET    /api/v1/assets/:id/allocation-history
GET    /api/v1/assets/:id/maintenance-history
```

### Allocation & Transfer
```
POST   /api/v1/allocations              → Allocate (conflict check)
POST   /api/v1/allocations/:id/return   → Return asset
GET    /api/v1/allocations/overdue

POST   /api/v1/transfers                → Request transfer
PATCH  /api/v1/transfers/:id/approve
PATCH  /api/v1/transfers/:id/reject
```

### Booking
```
GET    /api/v1/bookings?assetId=&date=  → Calendar slots
POST   /api/v1/bookings                 → Create (overlap check)
PATCH  /api/v1/bookings/:id/cancel
PATCH  /api/v1/bookings/:id/reschedule
```

### Maintenance
```
POST   /api/v1/maintenance              → Raise request
GET    /api/v1/maintenance
PATCH  /api/v1/maintenance/:id/approve
PATCH  /api/v1/maintenance/:id/reject
PATCH  /api/v1/maintenance/:id/assign-technician
PATCH  /api/v1/maintenance/:id/resolve
```

### Audit
```
POST   /api/v1/audits                   → Create cycle
GET    /api/v1/audits
GET    /api/v1/audits/:id
POST   /api/v1/audits/:id/entries       → Submit audit result per asset
POST   /api/v1/audits/:id/close         → Close cycle + generate report
```

### Reports
```
GET    /api/v1/reports/utilization
GET    /api/v1/reports/maintenance-frequency
GET    /api/v1/reports/idle-assets
GET    /api/v1/reports/booking-heatmap
GET    /api/v1/reports/department-summary
GET    /api/v1/reports/export?type=pdf|csv
```

### Notifications
```
GET    /api/v1/notifications
PATCH  /api/v1/notifications/:id/read
PATCH  /api/v1/notifications/read-all
GET    /api/v1/activity-logs
```

---

## 8. Implementation Phases

### Phase 0 — Project Bootstrap (Day 1, ~2 hrs)
- [ ] Init monorepo: `assetflow/frontend` + `assetflow/backend`
- [ ] Configure TypeScript strict mode on both
- [ ] Set up Prisma + PostgreSQL connection
- [ ] Configure Tailwind + shadcn/ui
- [ ] Set up Axios instance with interceptors
- [ ] Set up React Query provider
- [ ] Set up Zustand auth store
- [ ] Set up centralized error middleware on backend
- [ ] Set up consistent API response util

### Phase 1 — Auth (Day 1, ~3 hrs)
- [ ] Prisma User model
- [ ] POST `/auth/signup` → hash password, create EMPLOYEE role user
- [ ] POST `/auth/login` → verify, return JWT
- [ ] Auth middleware (JWT verify)
- [ ] Role guard middleware
- [ ] Login page (Next.js)
- [ ] Signup page
- [ ] Zustand store: save user + token
- [ ] Axios interceptor: attach Authorization header
- [ ] Route protection with RoleGuard component

### Phase 2 — Organization Setup (Day 1–2, ~4 hrs)
- [ ] Department model + CRUD API (Admin only)
- [ ] Department Head assignment
- [ ] Parent department hierarchy
- [ ] Asset Category model + CRUD API
- [ ] Employee Directory API (list, promote role, toggle status)
- [ ] Organization Setup page: 3-tab layout
  - Tab A: Departments table + create/edit modal
  - Tab B: Categories table + create/edit modal
  - Tab C: Employees table + role promotion modal

### Phase 3 — Asset Registry (Day 2, ~4 hrs)
- [ ] Asset model + auto-tag generator (AF-0001)
- [ ] POST `/assets` → register
- [ ] GET `/assets` → search by tag, serial, category, status, dept, location
- [ ] Asset detail page with allocation + maintenance history
- [ ] Asset Registration modal (form with all fields)
- [ ] Asset Directory page: table + filters + search
- [ ] StatusBadge component for lifecycle states

### Phase 4 — Allocation & Transfer (Day 2–3, ~5 hrs)
- [ ] Allocation model
- [ ] POST `/allocations` → conflict check (block if already allocated)
- [ ] Return flow: capture condition notes, revert to AVAILABLE
- [ ] Overdue detection: cron-like check on `expectedReturnAt`
- [ ] TransferRequest model + approval flow
- [ ] Allocation & Transfer page
  - Allocate form with conflict error + Transfer CTA
  - Active allocations table
  - Transfer requests section (approve/reject)
  - Overdue allocations flagged in red

### Phase 5 — Resource Booking (Day 3, ~3 hrs)
- [ ] ResourceBooking model
- [ ] POST `/bookings` → overlap validation query
- [ ] GET `/bookings?assetId=&date=` → calendar data
- [ ] Cancel / reschedule
- [ ] Booking page: calendar view + time slot picker
- [ ] Show conflict reason on rejection

### Phase 6 — Maintenance (Day 3, ~3 hrs)
- [ ] MaintenanceRequest model
- [ ] Full workflow: PENDING → APPROVED → TECHNICIAN_ASSIGNED → IN_PROGRESS → RESOLVED
- [ ] Asset status auto-update on approve + resolve
- [ ] Maintenance page: Kanban board (5 columns)
- [ ] Raise Request modal
- [ ] Assign Technician modal (Asset Manager)

### Phase 7 — Asset Audit (Day 4, ~3 hrs)
- [ ] AuditCycle + AuditAssignment + AuditEntry models
- [ ] Create cycle with scope (dept/location) + date range
- [ ] Assign auditors
- [ ] Auditor marks each asset: VERIFIED / MISSING / DAMAGED
- [ ] Auto-generate discrepancy report on Close
- [ ] Close cycle: lock + update asset statuses (LOST for MISSING)
- [ ] Audit page: cycle list + checklist table + close action

### Phase 8 — Reports & Analytics (Day 4, ~3 hrs)
- [ ] Utilization query: bookings per asset
- [ ] Maintenance frequency: requests per asset/category
- [ ] Idle assets: AVAILABLE > 60 days
- [ ] Department allocation summary
- [ ] Booking heatmap: hour-of-day aggregation
- [ ] Assets nearing retirement / maintenance due
- [ ] Reports page: charts (Recharts) + export button
- [ ] CSV export using server-side streaming

### Phase 9 — Notifications & Logs (Day 4, ~2 hrs)
- [ ] Notification model + service (called internally from other services)
- [ ] ActivityLog model + service
- [ ] Notification triggers:
  - Asset allocated → notify employee
  - Overdue return → notify manager + employee
  - Booking confirmed → notify user
  - Booking cancelled → notify user
  - Booking reminder → notify user before slot starts
  - Maintenance approved → notify requester
  - Maintenance rejected → notify requester
  - Transfer approved → Re-allocated → notify both from-user and to-user
  - Audit discrepancy flagged → notify admin
- [ ] Notifications page: tabs (All | Alerts | Approvals | Bookings)
- [ ] Mark read / mark all read
- [ ] Activity log table with filters

### Phase 10 — Dashboard (Day 5, ~2 hrs)
- [ ] KPI query: available, allocated, maintenance today, active bookings, pending transfers, upcoming returns
- [ ] Overdue returns highlighted separately
- [ ] Recent activity feed
- [ ] Quick action buttons: Register Asset, Book Resource, Raise Maintenance
- [ ] Role-specific KPI visibility

### Phase 11 — Polish & QA (Day 5, ~3 hrs)
- [ ] Empty states on all tables
- [ ] Loading skeletons on all async fetches
- [ ] Error handling on all forms
- [ ] Mobile responsiveness check on all pages
- [ ] Seed script with realistic demo data (3 depts, 2 managers, 10 employees, 20 assets)
- [ ] Final walkthrough: all 10 screens functional

---

## 9. Screen-by-Screen Build Plan

### Screen 1 — Login / Signup
**Key constraint:** Signup = EMPLOYEE only. No role selection.
- Components: `LoginForm`, `SignupForm`
- Validation: email format, password min 8 chars
- On signup success → redirect to dashboard (role: EMPLOYEE)
- Admin promotes roles from Organization Setup → Employee Directory

### Screen 2 — Dashboard
**Role-aware KPI cards:**
- Admin/Manager: sees all 6 KPIs
- Dept Head: sees dept-scoped KPIs
- Employee: sees own assets only
- Overdue returns: separate red section from upcoming returns

### Screen 3 — Organization Setup (Admin only)
**3 tabs:**
- **Departments**: table with Name, Head, Parent, Status. Create/Edit modal. Deactivate toggle.
- **Categories**: table with Name, Custom Fields. Expandable fields JSON editor.
- **Employees**: table with Name, Email, Dept, Role, Status. Role promotion modal (select new role → confirm).

### Screen 4 — Asset Registration & Directory
**Register fields (exact from PDF):** Name, Category (dropdown from Org Setup), auto-generated Asset Tag (AF-0001), Serial Number, Acquisition Date, Acquisition Cost *(stored for reports/ranking only — never linked to accounting)*, Condition, Location, Photo/Documents, `isBookable` flag *(marks asset as shared resource — this drives the Resource Booking screen's resource picker)*
- Search bar (debounced): Asset Tag, Serial Number, QR code, Name
- Filters: Category | Status | Department | Location
- Table columns: Tag | Name | Category | Status | Location — with `StatusBadge`
- Click row → Asset Detail page showing:
  - Full asset info
  - Allocation history timeline (who held it, when, condition notes on return)
  - Maintenance history (all requests + resolutions)

### Screen 5 — Asset Allocation & Transfer
**Critical conflict rule (exact from PDF):** Priya holds Laptop AF-0114. Raj tries to allocate it → system **blocks**, shows *"Currently held by Priya Shah (Engineering)"*, and shows **"Request Transfer"** button — not an error message and done.

**Transfer workflow (3 states):**
```
Requested → Approved (Asset Manager / Dept Head) → Re-allocated
                                                    (allocation history auto-updated)
```
**Return flow:** Mark returned → capture condition check-in notes (mandatory) → asset status reverts to AVAILABLE → allocation record updated with `returnedAt` + `conditionNotes`

**Allocation history section** (bottom of page): shows all past allocations for selected asset — date, employee, return date, condition on return

**Overdue section:** auto-flagged red when `expectedReturnAt < now()` — feeds Dashboard KPI + Notifications

### Screen 6 — Resource Booking
- Resource selector dropdown → shows **only assets with `isBookable = true`**
- Calendar view per resource: existing bookings as coloured blocks, requested/conflicting slots as dashed blocks
- Time slot picker → overlap validation before submit:
  - **Exact boundary is OK:** Room B2 booked 9:00–10:00. Request for 10:00–11:00 → **allowed**
  - **Any overlap is rejected:** Request for 9:30–10:30 → **rejected** with message showing conflicting slot
- Booking statuses: Upcoming | Ongoing | Completed | Cancelled
- Cancel / reschedule actions on my bookings
- **Reminder notification** auto-sent before slot starts (trigger in notification service)
- My Bookings table below calendar

### Screen 7 — Maintenance Management
**Kanban columns (5):** Pending | Approved | Technician Assigned | In Progress | Resolved

**Workflow (exact from PDF):**
```
Pending → Approved / Rejected (by Asset Manager)
                ↓
        Technician Assigned (Asset Manager picks technician)
                ↓
           In Progress
                ↓
            Resolved
```
**Asset status auto-transitions (critical):**
- On **Approved** → asset status becomes `UNDER_MAINTENANCE`
- On **Resolved** → asset status reverts to `AVAILABLE`
- Asset does NOT change status on Pending or Rejected

- Raise Request modal: asset selector, issue description, priority (Low/Medium/High/Critical), optional photo
- Approve/Reject action on Pending card (Asset Manager only)
- Assign Technician modal on Approved card
- Resolve modal: resolution notes required → closes card + updates asset
- Maintenance history retained per asset (visible on asset detail page)

### Screen 8 — Asset Audit
**Create Audit Cycle:** scope (department OR location), date range, assign one or more auditors

**Checklist table columns:** Asset Tag | Name | Expected Location | Verification (Pending/Verified/Missing/Damaged)
- Each auditor marks their assigned assets — Verified / Missing / Damaged
- Flagged items (Missing/Damaged) auto-appear in discrepancy report preview

**Close Audit Cycle (irreversible):**
- Locks the cycle — no further edits
- Assets confirmed **Missing** → status updated to `LOST`
- Assets confirmed **Damaged** → status updated to `UNDER_MAINTENANCE` (triggers maintenance flow)
- Discrepancy report auto-generated with all flagged items
- Audit history retained per cycle (never deleted)

### Screen 9 — Reports & Analytics
- **Utilization by Department** — bar chart (booking count / allocation count per dept)
- **Maintenance Frequency** — line chart (requests per asset or category over time)
- **Most Used Assets** — ranked list by booking count
- **Idle Assets** — assets with `AVAILABLE` status > 60 days
- **Booking Heatmap** — grid of peak usage windows (day × hour)
- **Assets due for maintenance / nearing retirement** — table (e.g. service due in 5 days, age > 9 yrs)
- **Department-wise allocation summary** — table (total assets per dept, allocated vs available)
- Export Report button → CSV/PDF download

### Screen 10 — Activity Logs & Notifications
**Notification types (exact from PDF):**
- Asset Assigned → notify employee
- Maintenance Approved / Rejected → notify requester
- Booking Confirmed / Cancelled / Reminder → notify user
- Transfer Approved → notify both parties
- Overdue Return Alert → notify manager + employee
- Audit Discrepancy Flagged → notify admin

**Tabs:** All | Alerts | Approvals | Bookings
- Unread count badge on Notifications nav link
- Click notification → mark as read + navigate to related entity
- Mark all read button

**Activity Log section** (separate from notifications):
- Full audit trail: *who did what, when* — admin/manager/employee actions
- Columns: Timestamp | User | Action | Entity | Details
- Searchable + filterable by date range and action type

---

## 10. Team Task Allocation — Dipesh / Utsave / Maulik

> **Strategy:** Each person owns complete features end-to-end (backend API + frontend UI) to avoid blocking each other. Shared foundation tasks are done together on Day 1 first thing.

---

### Day 1 — Shared Bootstrap (All 3 together, ~2 hrs max)

| Task | Who starts it |
|------|--------------|
| Create GitHub repo, branch strategy, invite all | Dipesh |
| Init `frontend/` — Next.js + TypeScript + Tailwind + shadcn/ui | Dipesh |
| Init `backend/` — Express + TypeScript + Prisma + PostgreSQL | Utsave |
| Write complete `schema.prisma` (all 13 models) | Utsave + Maulik review |
| Run `prisma migrate dev --name init` | Utsave |
| Setup Axios instance + interceptors in frontend | Dipesh |
| Setup React Query provider + Zustand auth store | Dipesh |
| Setup centralized error middleware + response util in backend | Utsave |
| Setup shared `RoleGuard` component + route protection logic | Dipesh |

After bootstrap: **split and work in parallel from here.**

---

### 👤 Dipesh — Frontend Lead

**Owns:** Project setup, shared components, Auth, Dashboard, Organization Setup, Asset Registry

#### Day 1 — Shared Components (build these first — Utsave & Maulik depend on them)
- [ ] `Sidebar.tsx` — nav links with active state, role-aware visibility
- [ ] `Navbar.tsx` — user avatar, role badge, logout, notification bell with unread count
- [ ] `RoleGuard.tsx` — wraps pages, redirects unauthorized users
- [ ] `DataTable.tsx` — reusable table with sorting, pagination, search slot
- [ ] `StatusBadge.tsx` — colour-coded badge for AssetStatus, BookingStatus, etc.
- [ ] `EmptyState.tsx` — icon + message + optional action button
- [ ] `LoadingSkeleton.tsx` — generic skeleton for tables and cards
- [ ] `ConfirmDialog.tsx` — reusable confirm modal (used for delete, deactivate, close audit)
- [ ] `lib/axios.ts` — Axios instance with base URL + Authorization header interceptor
- [ ] `store/auth.store.ts` — Zustand store: user, token, setUser, clearUser
- [ ] `providers/QueryProvider.tsx` — TanStack Query setup
- [ ] `utils/cn.ts`, `utils/date.ts`, `utils/format.ts`

#### Day 1 — Screen 1: Auth
- [ ] `(auth)/login/page.tsx` — login form, email + password, forgot password link
- [ ] `(auth)/signup/page.tsx` — signup form, on success → EMPLOYEE account, redirect to dashboard
- [ ] `features/auth/schema.ts` — Zod schemas for login + signup
- [ ] `features/auth/services/auth.service.ts` — Axios calls: login, signup, me
- [ ] `features/auth/hooks/useAuth.ts` — React Query hooks wrapping auth service
- [ ] After login: store JWT in Zustand + localStorage, attach to all future requests

#### Day 2 — Screen 2: Dashboard
- [ ] `features/dashboard/services/dashboard.service.ts` — call `/dashboard/kpis` + `/dashboard/recent-activity`
- [ ] `features/dashboard/hooks/useDashboard.ts`
- [ ] `features/dashboard/components/KPICard.tsx` — stat number + label + icon + colour
- [ ] `features/dashboard/components/OverdueAlert.tsx` — red section for overdue returns
- [ ] `features/dashboard/components/RecentActivity.tsx` — timestamped activity feed
- [ ] `features/dashboard/components/QuickActions.tsx` — 3 buttons: Register Asset, Book Resource, Raise Maintenance
- [ ] `(dashboard)/dashboard/page.tsx` — assemble all above, role-aware KPI visibility

#### Day 2 — Screen 3: Organization Setup (Admin only)
- [ ] `(dashboard)/organization/page.tsx` — 3-tab layout (shadcn Tabs component)
- [ ] **Tab A — Departments:**
  - [ ] Departments table: Name | Head | Parent Dept | Status
  - [ ] Create/Edit department modal (Name, Head dropdown, Parent dropdown, Status)
  - [ ] Deactivate toggle with confirm dialog
- [ ] **Tab B — Asset Categories:**
  - [ ] Categories table: Name | Custom Fields | Actions
  - [ ] Create/Edit category modal (Name + optional custom fields JSON)
- [ ] **Tab C — Employee Directory:**
  - [ ] Employees table: Name | Email | Department | Role | Status
  - [ ] Role promotion modal: select role from dropdown → confirm (only Admin can see this)
  - [ ] Toggle Active/Inactive status
- [ ] All tabs use `DataTable`, `EmptyState`, `ConfirmDialog`, `StatusBadge`
- [ ] React Query hooks: `useGetDepartments`, `useCreateDepartment`, `useGetCategories`, `useGetEmployees`, `usePromoteRole`

#### Day 3 — Screen 4: Asset Registry
- [ ] `(dashboard)/assets/page.tsx` — asset directory
  - [ ] Search bar (debounced 300ms): searches tag, serial, QR, name
  - [ ] Filters: Category | Status | Department | Location — reset filters button
  - [ ] Assets table: Tag | Name | Category | Status (StatusBadge) | Location
  - [ ] "+ Register Asset" button → opens registration modal
- [ ] **Register Asset Modal:**
  - [ ] Fields: Name, Category (from org setup), Serial Number, Acquisition Date, Acquisition Cost, Condition, Location, Photo upload, Document upload, isBookable toggle
  - [ ] Asset Tag auto-shown after creation (read-only, AF-XXXX)
  - [ ] Zod validation on all required fields
- [ ] `(dashboard)/assets/[id]/page.tsx` — Asset Detail:
  - [ ] Full asset info card
  - [ ] Allocation history timeline (date, employee name, return date, condition notes)
  - [ ] Maintenance history list (issue, priority, status, resolution date)
- [ ] React Query hooks: `useGetAssets`, `useCreateAsset`, `useGetAssetById`

---

### 👤 Utsave — Backend Lead

**Owns:** Entire backend foundation, DB schema, Auth API, Organization APIs, Asset API, Allocation & Transfer API, Resource Booking API

#### Day 1 — Backend Foundation
- [ ] Express app setup: `src/index.ts` with cors, helmet, json parser, rate limiter
- [ ] `src/config/env.ts` — validate all env variables on startup (throw if missing)
- [ ] `src/utils/response.ts` — `sendSuccess(res, data, message)` + `sendError(res, message, errors)`
- [ ] `src/middleware/error.middleware.ts` — catch-all error handler, never expose stack traces
- [ ] `src/middleware/auth.middleware.ts` — verify JWT, attach `req.user`
- [ ] `src/middleware/role.middleware.ts` — `requireRole(...roles)` factory function
- [ ] `src/middleware/validate.middleware.ts` — Zod schema validation on `req.body` / `req.query`
- [ ] `src/utils/jwt.ts` — `signToken(userId)`, `verifyToken(token)`
- [ ] `src/utils/assetTag.ts` — query DB for last tag number, return `AF-XXXX` padded
- [ ] `src/utils/logger.ts` — console logger with timestamps (no passwords/tokens logged)
- [ ] **Complete `schema.prisma`** — all 13 models with indexes, constraints, relations
- [ ] `prisma/seed.ts` — 1 Admin, 2 Asset Managers, 3 Dept Heads, 10 Employees, 3 Depts, 5 Categories, 20 Assets (mixed statuses), sample allocations, bookings, maintenance requests

#### Day 1 — Auth API
- [ ] `POST /api/v1/auth/signup` — hash password with bcrypt, create User with role=EMPLOYEE, return JWT
- [ ] `POST /api/v1/auth/login` — verify email + password, return JWT + user object
- [ ] `GET /api/v1/auth/me` — auth middleware required, return current user
- [ ] Zod validators: `signupSchema`, `loginSchema`

#### Day 2 — Organization APIs (Admin only)
- [ ] **Departments:**
  - [ ] `GET /departments` — list with head name, parent name, employee count
  - [ ] `POST /departments` — create with headId, parentId
  - [ ] `PUT /departments/:id` — edit
  - [ ] `PATCH /departments/:id/status` — toggle Active/Inactive
- [ ] **Categories:**
  - [ ] `GET /categories` — list all
  - [ ] `POST /categories` — create with optional `customFields` JSON
  - [ ] `PUT /categories/:id` — edit
- [ ] **Employees:**
  - [ ] `GET /employees` — list with dept, role, status
  - [ ] `PATCH /employees/:id/role` — promote role (Admin only, cannot set ADMIN via this route)
  - [ ] `PATCH /employees/:id/status` — toggle Active/Inactive
- [ ] Dashboard API:
  - [ ] `GET /dashboard/kpis` — query: available count, allocated count, maintenance today, active bookings, pending transfers, upcoming returns, overdue count
  - [ ] `GET /dashboard/recent-activity` — last 10 activity log entries

#### Day 2–3 — Asset API
- [ ] `GET /assets` — query params: `search`, `categoryId`, `status`, `departmentId`, `location`, `page`, `limit`
- [ ] `POST /assets` — register asset, auto-generate tag, log activity
- [ ] `GET /assets/:id` — full detail
- [ ] `PUT /assets/:id` — edit asset info
- [ ] `GET /assets/:id/allocation-history` — all allocation records for this asset
- [ ] `GET /assets/:id/maintenance-history` — all maintenance records for this asset
- [ ] Zod validators: `createAssetSchema`, `updateAssetSchema`

#### Day 3 — Allocation & Transfer API
- [ ] `POST /allocations` — **conflict check:** if asset has active allocation → return 409 with current holder info + `canRequestTransfer: true`. Else create allocation, update asset status to ALLOCATED, create notification + activity log
- [ ] `POST /allocations/:id/return` — mark returned (`returnedAt`, `conditionNotes`), asset → AVAILABLE, mark allocation RETURNED, create notification
- [ ] `GET /allocations/overdue` — all allocations where `expectedReturnAt < now()` and status=ACTIVE, auto-set `isOverdue=true`
- [ ] `POST /transfers` — create TransferRequest (status: REQUESTED)
- [ ] `PATCH /transfers/:id/approve` — update status to APPROVED → re-allocate asset to `toUser` → update allocation history → create notifications
- [ ] `PATCH /transfers/:id/reject` — update status to REJECTED → notify requester
- [ ] Zod validators: `createAllocationSchema`, `returnSchema`, `createTransferSchema`

#### Day 3 — Resource Booking API
- [ ] `GET /bookings?assetId=&date=` — return all bookings for a resource on a given date/week
- [ ] `POST /bookings` — **overlap check:** `SELECT * FROM ResourceBooking WHERE assetId=? AND status IN (UPCOMING,ONGOING) AND NOT (endTime <= newStart OR startTime >= newEnd)` — if found → reject with conflicting slot details. If OK → create booking, notify user
- [ ] `PATCH /bookings/:id/cancel` — cancel, update status, notify user
- [ ] `PATCH /bookings/:id/reschedule` — update times with overlap check, notify user
- [ ] Background task: check upcoming bookings → send reminder notifications (run on `/dashboard/kpis` call as side-effect check)
- [ ] Zod validators: `createBookingSchema`, `rescheduleSchema`

---

### 👤 Maulik — Features + QA + Polish

**Owns:** Maintenance (full-stack), Audit (full-stack), Reports (full-stack), Notifications (full-stack), Seed execution, QA, Polish

#### Day 1 — Notification + Activity Log Services (backend, used by everyone)
- [ ] `src/services/notification.service.ts`:
  - [ ] `createNotification(userId, type, message, entityId?)` — internal function called from all other services
  - [ ] Types: `ASSET_ASSIGNED`, `MAINTENANCE_APPROVED`, `MAINTENANCE_REJECTED`, `BOOKING_CONFIRMED`, `BOOKING_CANCELLED`, `BOOKING_REMINDER`, `TRANSFER_APPROVED`, `OVERDUE_RETURN`, `AUDIT_DISCREPANCY`
- [ ] `src/services/activityLog.service.ts`:
  - [ ] `logActivity(userId, action, entityType, entityId, metadata?)` — called after every state change
- [ ] `GET /notifications` — filter by `isRead`, `type`
- [ ] `PATCH /notifications/:id/read` — mark single read
- [ ] `PATCH /notifications/read-all` — mark all as read
- [ ] `GET /activity-logs` — paginated, filterable by date + action type

> **Critical:** Share these service functions with Utsave and Dipesh on Day 1 so they can call them from their own services.

#### Day 2 — Maintenance API + UI
- [ ] **Backend:**
  - [ ] `POST /maintenance` — create request, status=PENDING, log activity
  - [ ] `GET /maintenance` — list all, filterable by status, assetId, priority
  - [ ] `PATCH /maintenance/:id/approve` — status → APPROVED, asset → UNDER_MAINTENANCE, notify requester, log activity
  - [ ] `PATCH /maintenance/:id/reject` — status → REJECTED, notify requester
  - [ ] `PATCH /maintenance/:id/assign-technician` — status → TECHNICIAN_ASSIGNED, set technicianId, notify technician
  - [ ] `PATCH /maintenance/:id/in-progress` — status → IN_PROGRESS
  - [ ] `PATCH /maintenance/:id/resolve` — status → RESOLVED, asset → AVAILABLE, `resolvedAt = now()`, save notes, notify requester, log activity
  - [ ] Zod: `createMaintenanceSchema`, `resolveSchema`
- [ ] **Frontend (`(dashboard)/maintenance/page.tsx`):**
  - [ ] Kanban board: 5 columns (Pending | Approved | Technician Assigned | In Progress | Resolved)
  - [ ] Each card: asset tag, issue summary, priority badge, raised by, created date
  - [ ] Raise Maintenance Request modal: asset selector, issue textarea, priority select, photo upload
  - [ ] Approve/Reject buttons (Asset Manager only) on Pending cards
  - [ ] Assign Technician modal (Asset Manager only) on Approved cards
  - [ ] Resolve modal with resolution notes on In Progress cards
  - [ ] React Query hooks: `useGetMaintenance`, `useCreateMaintenance`, `useApproveMaintenance`, etc.

#### Day 3 — Audit API + UI
- [ ] **Backend:**
  - [ ] `POST /audits` — create AuditCycle with scope, date range
  - [ ] `POST /audits/:id/assign` — assign auditors (array of userIds)
  - [ ] `GET /audits` — list all cycles with status
  - [ ] `GET /audits/:id` — cycle detail + all entries + assignments
  - [ ] `POST /audits/:id/entries` — auditor submits entry: `{ assetId, status, notes }`
  - [ ] `POST /audits/:id/close` — validate all entries submitted → auto-generate discrepancy report → update MISSING assets to LOST → update DAMAGED assets to UNDER_MAINTENANCE → lock cycle (status=CLOSED) → log activity + notify admin
  - [ ] Zod: `createAuditSchema`, `auditEntrySchema`
- [ ] **Frontend (`(dashboard)/audit/page.tsx`):**
  - [ ] Audit Cycles list: Name | Scope | Date Range | Auditors | Status | Actions
  - [ ] Create Audit Cycle modal: name, dept/location scope, date range, multi-select auditors
  - [ ] Click cycle → open checklist view: table of all assets in scope
  - [ ] Each row: Tag | Name | Expected Location | Verification dropdown (Pending/Verified/Missing/Damaged) | Notes
  - [ ] Discrepancy report preview (flagged items list) before closing
  - [ ] Close Audit Cycle button → confirm dialog ("This is irreversible") → submit
  - [ ] Closed cycles: read-only with discrepancy report viewable

#### Day 4 — Reports API + UI
- [ ] **Backend (`/reports` routes):**
  - [ ] `GET /reports/utilization` — asset bookings + allocations aggregated by department
  - [ ] `GET /reports/maintenance-frequency` — count of maintenance requests grouped by asset/category + month
  - [ ] `GET /reports/idle-assets` — assets with status=AVAILABLE and `updatedAt < now() - 60 days`
  - [ ] `GET /reports/booking-heatmap` — bookings grouped by day-of-week + hour-of-day
  - [ ] `GET /reports/department-summary` — per dept: total assets, allocated, available, under maintenance
  - [ ] `GET /reports/due-maintenance` — assets with maintenance due soon or age > threshold
  - [ ] `GET /reports/export?type=csv` — CSV export of full asset list with current status
- [ ] **Frontend (`(dashboard)/reports/page.tsx`):**
  - [ ] Utilization by Department — `BarChart` (Recharts)
  - [ ] Maintenance Frequency — `LineChart` (Recharts)
  - [ ] Most Used / Idle Assets — two-column card layout
  - [ ] Booking Heatmap — custom grid component (day × hour cells, colour intensity by count)
  - [ ] Assets due for maintenance / nearing retirement — table with urgency highlighting
  - [ ] Export Report button → triggers CSV download via `<a href>` with blob

#### Day 4 — Notifications + Activity Log UI
- [ ] `(dashboard)/notifications/page.tsx`:
  - [ ] Tabs: All | Alerts | Approvals | Bookings
  - [ ] Notification list item: icon by type, message, timestamp, unread dot
  - [ ] Click → mark read + navigate to related entity (pass `entityId` in notification)
  - [ ] Mark All Read button
  - [ ] Bell icon in Navbar shows unread count badge (poll every 30s using React Query `refetchInterval`)
- [ ] Activity Log section on same page (scrollable table below notifications)
- [ ] React Query hooks: `useGetNotifications`, `useMarkRead`, `useMarkAllRead`, `useGetActivityLogs`

#### Day 5 — Allocation & Transfer UI (assisting Dipesh)
- [ ] `(dashboard)/allocation/page.tsx`:
  - [ ] Allocate Asset form: asset selector (unallocated assets only), employee selector, optional expected return date
  - [ ] **Conflict response UI:** red banner "Currently held by Priya Shah (Engineering)" + "Request Transfer" button that pre-fills transfer form
  - [ ] Transfer Requests section: pending transfers with Approve/Reject buttons (for Asset Manager/Dept Head)
  - [ ] Active Allocations table: Asset | Employee | Allocated On | Expected Return | Status
  - [ ] Overdue Allocations section: red highlighted, "Flag for follow-up" action
  - [ ] Return Asset modal: select allocation → add condition notes → submit
- [ ] `(dashboard)/booking/page.tsx`:
  - [ ] Resource dropdown (isBookable assets only)
  - [ ] Calendar view (weekly, coloured slots per booking status)
  - [ ] Time slot form: Start time | End time | Notes
  - [ ] Conflict error: show which slot conflicts
  - [ ] My Bookings table: Resource | Date | Time | Status | Actions (Cancel, Reschedule)

#### Day 5 — QA + Polish (full day focus)
- [ ] Verify all empty states exist on every table
- [ ] Verify loading skeletons on every async fetch
- [ ] Verify error states on all forms with meaningful messages (not "Something went wrong")
- [ ] Mobile responsiveness: test all 10 screens on 375px width
- [ ] Run `prisma db seed` → walkthrough all 10 screens with demo data
- [ ] Fix any TypeScript `any` types found during build
- [ ] Verify notification is created for every listed trigger
- [ ] Verify activity log entry is created for every state change
- [ ] Final `npm run build` must pass with zero errors

---

### Team Communication Rules

```
1. Post in team chat when you FINISH a backend endpoint — include route + response shape
   → Dipesh/Maulik can start connecting frontend immediately

2. Post in team chat when you FINISH a shared component
   → Others can use it without re-building

3. Never push directly to main or develop — always PR from feature branch

4. If blocked for more than 20 minutes — immediately ask the team, don't stay stuck

5. Merge order: backend API first, then frontend feature
```

### Branch ownership
```
feature/auth              → Dipesh
feature/dashboard         → Dipesh
feature/org-setup         → Dipesh
feature/assets-ui         → Dipesh
feature/backend-foundation → Utsave
feature/backend-auth       → Utsave
feature/backend-org        → Utsave
feature/backend-assets     → Utsave
feature/allocation-api    → Utsave
feature/booking-api       → Utsave
feature/maintenance       → Maulik
feature/audit             → Maulik
feature/reports           → Maulik
feature/notifications     → Maulik
feature/allocation-ui     → Maulik
feature/booking-ui        → Maulik
```

---

## 11. Environment Setup

### Backend `.env`
```env
DATABASE_URL="postgresql://user:password@localhost:5432/assetflow"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

### Frontend `.env.local`
```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api/v1"
```

### Setup Commands
```bash
# Clone repo
git clone https://github.com/your-org/assetflow.git
cd assetflow

# Backend
cd backend
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run dev

# Frontend
cd ../frontend
npm install
npm run dev
```

### Seed Script produces:
- 1 Admin user
- 2 Asset Managers
- 3 Department Heads
- 10 Employees across 3 departments
- 5 Asset Categories
- 20 Assets in various states
- Sample bookings, maintenance requests, and an active audit

---

## 12. Git Strategy

```
main            ← production-ready, protected
develop         ← integration branch
feature/auth
feature/org-setup
feature/assets
feature/allocation
feature/booking
feature/maintenance
feature/audit
feature/reports
feature/notifications
feature/dashboard
```

**Commit conventions:**
```
feat(auth): add JWT refresh token flow
fix(allocation): block double-allocation on race condition
chore(db): add index on allocation.status
```

---

## 13. Definition of Done

Before marking any screen complete:

- [ ] Backend API fully functional with validation
- [ ] Zod schema on both frontend (form) and backend (request)
- [ ] Role guard enforced on API route
- [ ] Loading skeleton shown during fetch
- [ ] Empty state shown when no data
- [ ] Error state shown on API failure
- [ ] Success toast on create/update/delete
- [ ] Mobile layout not broken
- [ ] No `any` types in TypeScript
- [ ] No duplicate API calls
- [ ] Business logic in service layer only
- [ ] Activity log entry created on every state change
- [ ] Notification created where applicable

---

## Critical Business Rules (Never Skip)

1. **No self-assigned admin roles** — signup always creates EMPLOYEE. Promotion is Admin-only.
2. **Double allocation blocked** — system shows current holder + transfer CTA.
3. **Booking overlap rejected** — exact boundary OK (10:00 end + 10:00 start = no overlap).
4. **Maintenance approval required** — asset stays ALLOCATED until approval, not on request creation.
5. **Audit closure locks cycle** — no edits after close, asset statuses update permanently.
6. **Overdue detection** — run on every dashboard load against `expectedReturnAt < now`.
7. **Asset tag auto-generated** — never manual, always `AF-XXXX` padded sequential.
8. **Transfer history preserved** — returning or transferring never deletes allocation records.
