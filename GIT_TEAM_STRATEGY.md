# 🌿 Git Team Strategy — AssetFlow
## 3 Members | 3 Branches | Hourly Commits | Zero Conflicts

---

## Why This Strategy Works Without Conflicts

The key insight: **each person owns completely separate files and folders**.
Dipesh owns frontend layout + auth + dashboard + assets UI.
Utsave owns entire backend.
Maulik owns maintenance + audit + reports + notifications (both frontend + backend).

Because no two people ever write to the same file, merging PRs produces **zero merge conflicts**.

---

## Branch Structure

```
main                  ← Protected. Only merge here at the END (demo-ready)
develop               ← Integration branch. Merge PRs here continuously.
│
├── feature/dipesh    ← Dipesh works here exclusively
├── feature/utsave    ← Utsave works here exclusively
└── feature/maulik    ← Maulik works here exclusively
```

> **Rule:** Never commit directly to `main` or `develop`. Always push to your own feature branch.

---

## Initial Setup (Dipesh does this — ~10 min, before clock starts)

```bash
git clone https://github.com/YOUR_ORG/enterprise-asset-management-odoo.git
cd enterprise-asset-management-odoo

git checkout -b develop && git push origin develop
git checkout -b feature/dipesh && git push origin feature/dipesh
git checkout develop && git checkout -b feature/utsave && git push origin feature/utsave
git checkout develop && git checkout -b feature/maulik && git push origin feature/maulik

# Each person checks out their branch
# Dipesh:  git checkout feature/dipesh
# Utsave:  git checkout feature/utsave
# Maulik:  git checkout feature/maulik
```

---

## File Ownership (Zero Overlap = Zero Conflicts)

### 👤 Dipesh — `feature/dipesh`
```
frontend/src/app/(auth)/
frontend/src/app/(dashboard)/dashboard/
frontend/src/app/(dashboard)/organization/
frontend/src/app/(dashboard)/assets/
frontend/src/components/layout/       ← Sidebar, Navbar, RoleGuard
frontend/src/components/common/       ← DataTable, EmptyState, StatusBadge…
frontend/src/components/ui/           ← shadcn primitives
frontend/src/features/auth/
frontend/src/features/dashboard/
frontend/src/features/organization/
frontend/src/features/assets/
frontend/src/hooks/
frontend/src/lib/axios.ts
frontend/src/providers/
frontend/src/store/
frontend/src/types/
frontend/src/utils/
frontend/src/app/layout.tsx
frontend/src/app/globals.css
frontend/package.json  tailwind.config.ts  tsconfig.json  next.config.js
```

### 👤 Utsave — `feature/utsave`
```
backend/prisma/schema.prisma
backend/prisma/seed.ts
backend/src/index.ts
backend/src/config/
backend/src/middleware/
backend/src/utils/
backend/src/controllers/auth | dashboard | organization | asset | allocation | booking
backend/src/routes/index.ts  auth | dashboard | org | asset | allocation | booking
backend/src/services/auth | dashboard | organization | asset | allocation | booking
backend/src/validators/auth | asset | allocation | booking
backend/package.json  tsconfig.json  .env.example
```

### 👤 Maulik — `feature/maulik`
```
frontend/src/app/(dashboard)/maintenance | audit | reports | notifications | allocation | booking
frontend/src/features/maintenance | audit | reports | notifications | allocation | booking
backend/src/controllers/maintenance | audit | report | notification
backend/src/routes/maintenance | audit | report | notification
backend/src/services/maintenance | audit | report | notification | activityLog
backend/src/validators/maintenance | audit
README.md
```

---

## The Only 2 Potentially Shared Files

| File | Owner | Rule |
|------|-------|------|
| `backend/src/routes/index.ts` | **Utsave** | Maulik builds route files, signals Utsave → Utsave mounts them |
| `frontend/src/app/(dashboard)/layout.tsx` | **Dipesh** | Maulik never edits it — Sidebar auto-includes all nav links |

---

---

# ⏱ 3.5-HOUR EXECUTION PLAN
## 5–6 PRs per person · 3–4 commits per PR · Every PR → develop

> **Current time: 11:54 AM IST**
> Work window: **11:54 AM → 3:24 PM IST**
> All 3 people work in **parallel** — no waiting on each other.

---

## ═══════════════════════════════════════
## 👤 DIPESH — Frontend Lead
## 6 PRs | 20 commits | feature/dipesh → develop
## ═══════════════════════════════════════

---

### PR 1 — `feat: project setup + shared component library`
**Time: 11:54 AM → 12:30 PM (36 min)**

```bash
# Commit 1 — 12:05 PM
git add .
git commit -m "chore(setup): init Next.js 14 with TypeScript strict, Tailwind, shadcn/ui"
git push origin feature/dipesh

# Commit 2 — 12:15 PM
git add .
git commit -m "feat(layout): Sidebar with role-aware nav links, Navbar with user avatar + logout"

# Commit 3 — 12:25 PM
git add .
git commit -m "feat(common): DataTable, EmptyState, LoadingSkeleton, ConfirmDialog, StatusBadge"

# Commit 4 — 12:30 PM
git add .
git commit -m "feat(lib): Axios instance with base URL + auth interceptor, Zustand auth store, QueryProvider"
git push origin feature/dipesh
```

**→ Open PR 1: `feature/dipesh → develop`**
**PR title:** `feat: project setup + shared component library`
**Description:** Next.js init, Tailwind, shadcn, layout shell, 5 common components, Axios, Zustand, QueryProvider
**Merge:** Immediately after review (~2 min)

---

### PR 2 — `feat: auth UI — login + signup pages`
**Time: 12:30 PM → 1:05 PM (35 min)**

```bash
# First sync develop after PR1 merged
git fetch origin && git merge origin/develop

# Commit 1 — 12:42 PM
git add .
git commit -m "feat(auth): LoginForm with email/password, Zod validation, error state"
git push origin feature/dipesh

# Commit 2 — 12:52 PM
git add .
git commit -m "feat(auth): SignupForm - EMPLOYEE only, password strength indicator, success redirect"

# Commit 3 — 1:02 PM
git add .
git commit -m "feat(auth): useAuth hook + auth.service.ts API calls, JWT stored in Zustand + localStorage"
git push origin feature/dipesh
```

**→ Open PR 2: `feature/dipesh → develop`**
**PR title:** `feat: auth UI — login, signup, JWT integration`

---

### PR 3 — `feat: dashboard UI — KPIs + activity feed`
**Time: 1:05 PM → 1:40 PM (35 min)**

```bash
git fetch origin && git merge origin/develop

# Commit 1 — 1:18 PM
git add .
git commit -m "feat(dashboard): KPICard component — stat, label, icon, colour, role-aware visibility"
git push origin feature/dipesh

# Commit 2 — 1:28 PM
git add .
git commit -m "feat(dashboard): RecentActivity feed + OverdueAlert red section + QuickActions (3 buttons)"

# Commit 3 — 1:38 PM
git add .
git commit -m "feat(dashboard): dashboard page assembled, useDashboard hook, dashboard.service.ts"
git push origin feature/dipesh
```

**→ Open PR 3: `feature/dipesh → develop`**
**PR title:** `feat: dashboard UI — role-aware KPI cards, activity feed, quick actions`

---

### PR 4 — `feat: organization setup UI — departments, categories, employees`
**Time: 1:40 PM → 2:15 PM (35 min)**

```bash
git fetch origin && git merge origin/develop

# Commit 1 — 1:52 PM
git add .
git commit -m "feat(org): Departments tab — table, create/edit modal, deactivate toggle with ConfirmDialog"
git push origin feature/dipesh

# Commit 2 — 2:02 PM
git add .
git commit -m "feat(org): Categories tab — table + create/edit modal with custom fields"

# Commit 3 — 2:12 PM
git add .
git commit -m "feat(org): Employee Directory tab — role promotion modal (Admin only), status toggle"
git push origin feature/dipesh
```

**→ Open PR 4: `feature/dipesh → develop`**
**PR title:** `feat: organization setup page — 3-tab layout (departments, categories, employees)`

---

### PR 5 — `feat: asset registry UI — directory + register + detail`
**Time: 2:15 PM → 2:55 PM (40 min)**

```bash
git fetch origin && git merge origin/develop

# Commit 1 — 2:27 PM
git add .
git commit -m "feat(assets): asset directory page — debounced search, 4 filters, status badge table"
git push origin feature/dipesh

# Commit 2 — 2:38 PM
git add .
git commit -m "feat(assets): Register Asset modal — all fields, auto-tag shown after creation, Zod validation"

# Commit 3 — 2:48 PM
git add .
git commit -m "feat(assets): asset detail page — info card, allocation history timeline, maintenance history"

# Commit 4 — 2:55 PM
git add .
git commit -m "feat(assets): useGetAssets, useCreateAsset, useGetAssetById hooks + asset.service.ts"
git push origin feature/dipesh
```

**→ Open PR 5: `feature/dipesh → develop`**
**PR title:** `feat: asset registry — directory, registration modal, detail page with history`

---

### PR 6 — `fix: polish — empty states, loading skeletons, final build`
**Time: 2:55 PM → 3:24 PM (29 min)**

```bash
git fetch origin && git merge origin/develop

# Commit 1 — 3:05 PM
git add .
git commit -m "fix(ui): add EmptyState to all 5 pages — with icon, message, action button"
git push origin feature/dipesh

# Commit 2 — 3:14 PM
git add .
git commit -m "fix(ui): LoadingSkeleton on every async fetch — table rows, card grids"

# Commit 3 — 3:22 PM
git add .
git commit -m "chore: npm run build passes zero errors, fix any TypeScript any types"
git push origin feature/dipesh
```

**→ Open PR 6: `feature/dipesh → develop`**
**PR title:** `fix: UI polish — empty states, loading states, TypeScript strict pass`

---

## ═══════════════════════════════════════
## 👤 UTSAVE — Backend Lead
## 6 PRs | 22 commits | feature/utsave → develop
## ═══════════════════════════════════════

---

### PR 1 — `feat: backend foundation + complete DB schema`
**Time: 11:54 AM → 12:35 PM (41 min)**

```bash
# Commit 1 — 12:08 PM
git add .
git commit -m "chore(setup): init Express + TypeScript strict, folder structure, package.json scripts"
git push origin feature/utsave

# Commit 2 — 12:18 PM
git add .
git commit -m "feat(db): complete schema.prisma — all 13 models, enums, indexes, FK constraints"

# Commit 3 — 12:28 PM
git add .
git commit -m "feat(config): env.ts Zod validation on startup, database.ts Prisma singleton, constants.ts"

# Commit 4 — 12:35 PM
git add .
git commit -m "feat(middleware): auth.middleware, role.middleware, validate.middleware, error.middleware + response.ts utils"
git push origin feature/utsave
```

**→ Open PR 1: `feature/utsave → develop`**
**PR title:** `feat: backend foundation — Express setup, full Prisma schema, middleware stack`

---

### PR 2 — `feat: auth API + JWT utils + seed script`
**Time: 12:35 PM → 1:10 PM (35 min)**

```bash
git fetch origin && git merge origin/develop

# Commit 1 — 12:48 PM
git add .
git commit -m "feat(auth): POST /signup — bcrypt hash, create EMPLOYEE user, return JWT"
git push origin feature/utsave

# Commit 2 — 12:58 PM
git add .
git commit -m "feat(auth): POST /login — verify credentials, return JWT + user. GET /me — auth guard"

# Commit 3 — 1:07 PM
git add .
git commit -m "feat(auth): signupSchema + loginSchema Zod validators, jwt.ts signToken/verifyToken, assetTag.ts AF-XXXX generator"

# Commit 4 — 1:10 PM  (push immediately — Dipesh needs axios to work)
git add .
git commit -m "feat(seed): seed.ts — 1 admin, 2 managers, 3 dept heads, 10 employees, 3 depts, 5 categories, 20 assets mixed states"
git push origin feature/utsave
```

**→ Open PR 2: `feature/utsave → develop`**
**PR title:** `feat: auth API (signup/login/me), JWT utils, auto asset tag, full seed script`
**⚡ Signal to team:** "Auth API live — POST /api/v1/auth/signup + /login. JWT in `Authorization: Bearer <token>`"

---

### PR 3 — `feat: dashboard API + organization APIs`
**Time: 1:10 PM → 1:48 PM (38 min)**

```bash
git fetch origin && git merge origin/develop

# Commit 1 — 1:22 PM
git add .
git commit -m "feat(dashboard): GET /kpis — 7 counts (available, allocated, maintenance, bookings, transfers, overdue, upcoming). GET /recent-activity"
git push origin feature/utsave

# Commit 2 — 1:32 PM
git add .
git commit -m "feat(org): departments CRUD — GET list with head+parent+count, POST create, PUT edit, PATCH status"

# Commit 3 — 1:42 PM
git add .
git commit -m "feat(org): categories CRUD. Employees: GET list, PATCH /role (Admin only, no ADMIN self-promotion), PATCH /status"
git push origin feature/utsave
```

**→ Open PR 3: `feature/utsave → develop`**
**PR title:** `feat: dashboard KPIs + org APIs (departments, categories, employee directory)`

---

### PR 4 — `feat: asset API — CRUD + search + history`
**Time: 1:48 PM → 2:20 PM (32 min)**

```bash
git fetch origin && git merge origin/develop

# Commit 1 — 2:00 PM
git add .
git commit -m "feat(assets): GET /assets — search, filter by category/status/dept/location, pagination"
git push origin feature/utsave

# Commit 2 — 2:10 PM
git add .
git commit -m "feat(assets): POST /assets — auto-generate AF-XXXX tag, log activity. PUT /assets/:id"

# Commit 3 — 2:18 PM
git add .
git commit -m "feat(assets): GET /assets/:id full detail. GET /assets/:id/allocation-history + /maintenance-history. Zod validators"
git push origin feature/utsave
```

**→ Open PR 4: `feature/utsave → develop`**
**PR title:** `feat: asset API — search, paginated list, register with auto-tag, detail with history`
**⚡ Signal to team:** "Asset API live — all endpoints working. Dipesh can connect asset UI."

---

### PR 5 — `feat: allocation + transfer API`
**Time: 2:20 PM → 2:55 PM (35 min)**

```bash
git fetch origin && git merge origin/develop

# Commit 1 — 2:32 PM
git add .
git commit -m "feat(allocation): POST /allocations — conflict check returns 409 with holder info + canRequestTransfer flag"
git push origin feature/utsave

# Commit 2 — 2:42 PM
git add .
git commit -m "feat(allocation): POST /allocations/:id/return — conditionNotes required, asset→AVAILABLE, log. GET /allocations/overdue"

# Commit 3 — 2:52 PM
git add .
git commit -m "feat(transfer): POST /transfers. PATCH /transfers/:id/approve — re-allocate to toUser. PATCH reject. Zod validators"
git push origin feature/utsave
```

**→ Open PR 5: `feature/utsave → develop`**
**PR title:** `feat: allocation API (conflict detection) + transfer API (approve/reject workflow)`

---

### PR 6 — `feat: resource booking API + routes index`
**Time: 2:55 PM → 3:24 PM (29 min)**

```bash
git fetch origin && git merge origin/develop

# Commit 1 — 3:05 PM
git add .
git commit -m "feat(booking): GET /bookings?assetId=&date= — calendar data for isBookable assets only"
git push origin feature/utsave

# Commit 2 — 3:13 PM
git add .
git commit -m "feat(booking): POST /bookings — overlap check query (exact boundary OK). PATCH /cancel + /reschedule"

# Commit 3 — 3:22 PM  ← FINAL — mount ALL routes including Maulik's
git add .
git commit -m "chore(routes): mount all routes in index.ts — auth, dashboard, org, assets, allocation, booking, maintenance, audit, reports, notifications"
git push origin feature/utsave
```

**→ Open PR 6: `feature/utsave → develop`**
**PR title:** `feat: booking API (overlap validation) + all routes mounted in index.ts`
**⚡ Signal to team:** "All APIs live. routes/index.ts finalized."

---

## ═══════════════════════════════════════
## 👤 MAULIK — Features + QA Lead
## 5 PRs | 18 commits | feature/maulik → develop
## ═══════════════════════════════════════

---

### PR 1 — `feat: notification + activity log services (shared backend foundation)`
**Time: 11:54 AM → 12:30 PM (36 min)**
> ⚡ Build this FIRST — Utsave and team need these services on Day 1

```bash
# Commit 1 — 12:08 PM
git add .
git commit -m "feat(notification): notification.service.ts — createNotification(userId, type, message, entityId?)"
git push origin feature/maulik

# Commit 2 — 12:18 PM
git add .
git commit -m "feat(notification): 9 notification types: ASSET_ASSIGNED, MAINTENANCE_APPROVED/REJECTED, BOOKING_CONFIRMED/CANCELLED/REMINDER, TRANSFER_APPROVED, OVERDUE_RETURN, AUDIT_DISCREPANCY"

# Commit 3 — 12:27 PM
git add .
git commit -m "feat(activityLog): activityLog.service.ts — logActivity(userId, action, entityType, entityId, metadata?)"

# Commit 4 — 12:30 PM
git add .
git commit -m "feat(notification): GET /notifications + PATCH /:id/read + PATCH /read-all + GET /activity-logs endpoints"
git push origin feature/maulik
```

**→ Open PR 1: `feature/maulik → develop`**
**PR title:** `feat: notification service + activity log service — shared backend (all teams depend on this)`
**⚡ Signal to team:** "notificationService & logActivity exported and ready — import from `services/notification.service` and `services/activityLog.service`"

---

### PR 2 — `feat: maintenance — full-stack (API + Kanban UI)`
**Time: 12:30 PM → 1:20 PM (50 min)**

```bash
git fetch origin && git merge origin/develop

# Commit 1 — 12:45 PM
git add .
git commit -m "feat(maintenance): POST /maintenance, GET /maintenance with status/priority/asset filters"
git push origin feature/maulik

# Commit 2 — 12:58 PM
git add .
git commit -m "feat(maintenance): PATCH approve (asset→UNDER_MAINTENANCE) + reject + assign-technician + in-progress + resolve (asset→AVAILABLE)"

# Commit 3 — 1:10 PM
git add .
git commit -m "feat(maintenance): Kanban board UI — 5 columns, cards with tag/issue/priority badge/date"

# Commit 4 — 1:18 PM
git add .
git commit -m "feat(maintenance): Raise Request modal, Approve/Reject buttons (Manager only), Assign Technician modal, Resolve modal with notes"
git push origin feature/maulik
```

**→ Open PR 2: `feature/maulik → develop`**
**PR title:** `feat: maintenance full-stack — 6-step workflow API + Kanban board UI`

---

### PR 3 — `feat: asset audit — full-stack (API + checklist UI)`
**Time: 1:20 PM → 2:05 PM (45 min)**

```bash
git fetch origin && git merge origin/develop

# Commit 1 — 1:33 PM
git add .
git commit -m "feat(audit): POST /audits, POST /audits/:id/assign auditors, GET /audits list + GET /:id detail"
git push origin feature/maulik

# Commit 2 — 1:47 PM
git add .
git commit -m "feat(audit): POST /audits/:id/entries — auditor submits VERIFIED/MISSING/DAMAGED per asset"

# Commit 3 — 1:57 PM
git add .
git commit -m "feat(audit): POST /audits/:id/close — MISSING→LOST, DAMAGED→UNDER_MAINTENANCE, lock cycle, discrepancy report auto-generated"

# Commit 4 — 2:03 PM
git add .
git commit -m "feat(audit): audit cycles list, create cycle modal, checklist table, discrepancy preview, irreversible close confirm"
git push origin feature/maulik
```

**→ Open PR 3: `feature/maulik → develop`**
**PR title:** `feat: asset audit full-stack — create cycles, auditor checklist, close with auto asset status updates`

---

### PR 4 — `feat: reports + analytics — full-stack (API + charts UI)`
**Time: 2:05 PM → 2:50 PM (45 min)**

```bash
git fetch origin && git merge origin/develop

# Commit 1 — 2:18 PM
git add .
git commit -m "feat(reports): GET /reports/utilization + /maintenance-frequency + /idle-assets (AVAILABLE > 60 days)"
git push origin feature/maulik

# Commit 2 — 2:30 PM
git add .
git commit -m "feat(reports): GET /reports/booking-heatmap (day x hour grid) + /department-summary + /due-maintenance + /export?type=csv"

# Commit 3 — 2:42 PM
git add .
git commit -m "feat(reports): BarChart (utilization by dept), LineChart (maintenance frequency) — Recharts"

# Commit 4 — 2:48 PM
git add .
git commit -m "feat(reports): Booking Heatmap grid, most-used/idle assets cards, export CSV button, date range filter"
git push origin feature/maulik
```

**→ Open PR 4: `feature/maulik → develop`**
**PR title:** `feat: reports full-stack — 6 analytics endpoints + charts UI (bar, line, heatmap, export)`

---

### PR 5 — `feat: notifications UI + allocation UI + booking UI + QA`
**Time: 2:50 PM → 3:24 PM (34 min)**

```bash
git fetch origin && git merge origin/develop

# Commit 1 — 3:00 PM
git add .
git commit -m "feat(notifications): notifications page — 4 tabs, unread count badge, mark read/all read, click→navigate to entity"
git push origin feature/maulik

# Commit 2 — 3:09 PM
git add .
git commit -m "feat(allocation-ui): allocation page — allocate form, conflict banner with transfer CTA, transfer requests section, overdue table"

# Commit 3 — 3:17 PM
git add .
git commit -m "feat(booking-ui): booking page — isBookable resource dropdown, calendar weekly view, time slot form, conflict error, my bookings table"

# Commit 4 — 3:23 PM
git add .
git commit -m "chore(qa): verify empty + error + loading states on all Maulik pages, run prisma db seed, README.md updated"
git push origin feature/maulik
```

**→ Open PR 5: `feature/maulik → develop`**
**PR title:** `feat: notifications UI, allocation UI, booking UI + QA pass on all Maulik screens`

---

---

# 📊 Summary — All 3 People

| Person | PRs | Commits | Features Delivered |
|--------|-----|---------|-------------------|
| **Dipesh** | 6 PRs | 20 commits | Project setup, shared components, auth UI, dashboard UI, org setup UI, asset registry UI, polish |
| **Utsave** | 6 PRs | 22 commits | Backend foundation, schema, auth API, seed, dashboard/org APIs, asset API, allocation/transfer API, booking API |
| **Maulik** | 5 PRs | 18 commits | Notification service, maintenance full-stack, audit full-stack, reports full-stack, notifications/allocation/booking UI |
| **Total** | **17 PRs** | **60 commits** | **Complete application** |

---

# ⏱ Visual Timeline (All 3 Parallel)

```
TIME        DIPESH                          UTSAVE                          MAULIK
────────────────────────────────────────────────────────────────────────────────────
11:54       ◀ Setup starts
12:05       Commit 1 (setup)                Commit 1 (setup)                Commit 1 (notification svc)
12:15       Commit 2 (layout)               Commit 2 (schema)               Commit 2 (notif types)
12:25       Commit 3 (common components)    Commit 3 (config)               Commit 3 (activityLog)
12:30       Commit 4 (axios/zustand)        Commit 4 (middleware)           Commit 4 (notif endpoints)
            ★ MERGE PR 1                    ★ MERGE PR 1                    ★ MERGE PR 1
12:42       Commit 1 (LoginForm)            Commit 1 (signup API)           Commit 1 (maintenance API)
12:52       Commit 2 (SignupForm)           Commit 2 (login/me API)         Commit 2 (maintenance workflow)
1:02        Commit 3 (useAuth hook)         Commit 3 (validators + seed)    Commit 3 (kanban UI)
1:05        ★ MERGE PR 2 (auth UI)          Commit 4 (seed.ts)              Commit 4 (maintenance modals)
1:18        Commit 1 (KPICard)              ★ MERGE PR 2 (auth + seed)      ★ MERGE PR 2 (maintenance)
1:22                                        Commit 1 (dashboard KPIs)
1:28        Commit 2 (activity/overdue)     Commit 2 (departments CRUD)
1:32                                        Commit 3 (categories/employees)
1:33                                                                        Commit 1 (audit create)
1:38        Commit 3 (dashboard page)       ★ MERGE PR 3 (dashboard+org)
1:40        ★ MERGE PR 3 (dashboard UI)     Commit 1 (GET /assets)          Commit 2 (audit entries)
1:47                                                                        Commit 3 (audit close)
1:52        Commit 1 (departments tab)      Commit 2 (POST /assets)
2:00                                        Commit 3 (asset detail + hist)
2:02        Commit 2 (categories tab)       ★ MERGE PR 4 (asset API)        Commit 4 (audit UI)
2:05        ★ MERGE PR 4 (org setup UI)                                     ★ MERGE PR 3 (audit)
2:12        Commit 3 (employee tab)         Commit 1 (POST /allocations)
2:15                                                                        Commit 1 (reports APIs 1-3)
2:18        Commit 1 (asset directory)      Commit 2 (return + overdue)
2:27                                        Commit 3 (transfers API)        Commit 2 (reports APIs 4-6)
2:32        Commit 2 (register modal)       ★ MERGE PR 5 (allocation API)
2:38                                        Commit 1 (GET /bookings)        Commit 3 (charts UI)
2:42        Commit 3 (asset detail)         Commit 2 (POST /bookings)
2:48        ★ MERGE PR 5 (asset UI)         Commit 3 (cancel/reschedule)    Commit 4 (heatmap + export)
2:50                                                                        ★ MERGE PR 4 (reports)
2:52                                        ★ MERGE PR 6 (booking + routes)
2:55        Commit 1 (empty states)                                         Commit 1 (notifications UI)
3:00                                                                        Commit 2 (allocation UI)
3:05        Commit 2 (skeletons)                                            Commit 3 (booking UI)
3:14        Commit 3 (build pass)                                           Commit 4 (QA + README)
3:22        ★ MERGE PR 6 (polish)                                           ★ MERGE PR 5 (UI + QA)
3:24 ◀ DONE — All PRs merged to develop — Final merge develop → main
```

---

# 🔀 Final Merge to `main`

```bash
# Dipesh runs this after ALL 17 PRs are merged to develop
git checkout main
git merge develop --no-ff -m "feat: AssetFlow v1.0 — complete hackathon submission"
git push origin main
git tag v1.0.0-hackathon
git push origin v1.0.0-hackathon
```

---

# 📋 Commit Quick-Commands (Copy-Paste)

```bash
# Standard commit + push (run every commit)
git add . && git commit -m "feat(MODULE): description" && git push origin feature/YOUR_NAME

# Open PR (after final push for that PR)
# → Go to GitHub → Compare & Pull Request → feature/YOUR_NAME → develop

# Sync develop into your branch (after each merged PR)
git fetch origin && git merge origin/develop && git push origin feature/YOUR_NAME
```

---

# 🚦 Rules

| Rule | Detail |
|------|--------|
| **Never touch** another person's files | Even if it "would be faster" |
| **Never push to `main`** | Only via PR to develop, then develop→main at end |
| **Signal endpoints immediately** | Post in group chat when an API is ready with response shape |
| **Signal shared services** | Maulik posts when notificationService is exported |
| **Utsave mounts Maulik's routes** | Maulik builds route files, Utsave adds to index.ts in PR 6 |
| **Commit even if incomplete** | WIP commits are fine — `wip(module): partial description` |
