import { PrismaClient, Role, UserStatus, AssetStatus, AllocationStatus, BookingStatus, MaintenanceStatus, Priority, AuditCycleStatus, AuditEntryStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ─── Seed Script ───────────────────────────────────────────
// Creates demo data for AssetFlow:
// 1 Admin, 2 Asset Managers, 3 Dept Heads, 10 Employees
// 3 Departments, 5 Categories, 20 Assets (mixed statuses)
// Sample allocations, bookings, maintenance requests

async function main() {
  console.log("🌱 Starting seed...\n");

  // ─── Clean existing data ─────────────────────────────────
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditEntry.deleteMany();
  await prisma.auditAssignment.deleteMany();
  await prisma.auditCycle.deleteMany();
  await prisma.maintenanceRequest.deleteMany();
  await prisma.resourceBooking.deleteMany();
  await prisma.transferRequest.deleteMany();
  await prisma.allocation.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.assetCategory.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  console.log("🧹 Cleaned existing data\n");

  // ─── Hash password (shared for all seed users) ───────────
  const hashedPassword = await bcrypt.hash("Password@123", 10);

  // ═══════════════════════════════════════
  // DEPARTMENTS (3)
  // ═══════════════════════════════════════

  const engineering = await prisma.department.create({
    data: { name: "Engineering", status: UserStatus.ACTIVE },
  });

  const marketing = await prisma.department.create({
    data: { name: "Marketing", status: UserStatus.ACTIVE },
  });

  const operations = await prisma.department.create({
    data: { name: "Operations", status: UserStatus.ACTIVE },
  });

  console.log("🏢 Created 3 departments");

  // ═══════════════════════════════════════
  // USERS (16 total)
  // ═══════════════════════════════════════

  // 1 Admin
  const admin = await prisma.user.create({
    data: {
      name: "Rahul Sharma",
      email: "admin@assetflow.com",
      password: hashedPassword,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      departmentId: engineering.id,
    },
  });

  // 2 Asset Managers
  const manager1 = await prisma.user.create({
    data: {
      name: "Anjali Patel",
      email: "anjali.manager@assetflow.com",
      password: hashedPassword,
      role: Role.ASSET_MANAGER,
      status: UserStatus.ACTIVE,
      departmentId: engineering.id,
    },
  });

  await prisma.user.create({
    data: {
      name: "Vikram Singh",
      email: "vikram.manager@assetflow.com",
      password: hashedPassword,
      role: Role.ASSET_MANAGER,
      status: UserStatus.ACTIVE,
      departmentId: operations.id,
    },
  });

  // 3 Department Heads
  const deptHead1 = await prisma.user.create({
    data: {
      name: "Priya Shah",
      email: "priya.head@assetflow.com",
      password: hashedPassword,
      role: Role.DEPARTMENT_HEAD,
      status: UserStatus.ACTIVE,
      departmentId: engineering.id,
    },
  });

  const deptHead2 = await prisma.user.create({
    data: {
      name: "Karan Mehta",
      email: "karan.head@assetflow.com",
      password: hashedPassword,
      role: Role.DEPARTMENT_HEAD,
      status: UserStatus.ACTIVE,
      departmentId: marketing.id,
    },
  });

  const deptHead3 = await prisma.user.create({
    data: {
      name: "Sneha Gupta",
      email: "sneha.head@assetflow.com",
      password: hashedPassword,
      role: Role.DEPARTMENT_HEAD,
      status: UserStatus.ACTIVE,
      departmentId: operations.id,
    },
  });

  // Update departments with heads
  await prisma.department.update({
    where: { id: engineering.id },
    data: { headId: deptHead1.id },
  });
  await prisma.department.update({
    where: { id: marketing.id },
    data: { headId: deptHead2.id },
  });
  await prisma.department.update({
    where: { id: operations.id },
    data: { headId: deptHead3.id },
  });

  // 10 Employees
  const employees = await Promise.all([
    prisma.user.create({
      data: {
        name: "Raj Kumar",
        email: "raj@assetflow.com",
        password: hashedPassword,
        role: Role.EMPLOYEE,
        departmentId: engineering.id,
      },
    }),
    prisma.user.create({
      data: {
        name: "Deepika Nair",
        email: "deepika@assetflow.com",
        password: hashedPassword,
        role: Role.EMPLOYEE,
        departmentId: engineering.id,
      },
    }),
    prisma.user.create({
      data: {
        name: "Arjun Reddy",
        email: "arjun@assetflow.com",
        password: hashedPassword,
        role: Role.EMPLOYEE,
        departmentId: engineering.id,
      },
    }),
    prisma.user.create({
      data: {
        name: "Meera Joshi",
        email: "meera@assetflow.com",
        password: hashedPassword,
        role: Role.EMPLOYEE,
        departmentId: marketing.id,
      },
    }),
    prisma.user.create({
      data: {
        name: "Aditya Verma",
        email: "aditya@assetflow.com",
        password: hashedPassword,
        role: Role.EMPLOYEE,
        departmentId: marketing.id,
      },
    }),
    prisma.user.create({
      data: {
        name: "Kavita Desai",
        email: "kavita@assetflow.com",
        password: hashedPassword,
        role: Role.EMPLOYEE,
        departmentId: marketing.id,
      },
    }),
    prisma.user.create({
      data: {
        name: "Rohit Mishra",
        email: "rohit@assetflow.com",
        password: hashedPassword,
        role: Role.EMPLOYEE,
        departmentId: operations.id,
      },
    }),
    prisma.user.create({
      data: {
        name: "Nisha Kapoor",
        email: "nisha@assetflow.com",
        password: hashedPassword,
        role: Role.EMPLOYEE,
        departmentId: operations.id,
      },
    }),
    prisma.user.create({
      data: {
        name: "Suresh Iyer",
        email: "suresh@assetflow.com",
        password: hashedPassword,
        role: Role.EMPLOYEE,
        departmentId: operations.id,
      },
    }),
    prisma.user.create({
      data: {
        name: "Pooja Chauhan",
        email: "pooja@assetflow.com",
        password: hashedPassword,
        role: Role.EMPLOYEE,
        departmentId: operations.id,
      },
    }),
  ]);

  console.log("👥 Created 16 users (1 Admin, 2 Managers, 3 Dept Heads, 10 Employees)");

  // ═══════════════════════════════════════
  // ASSET CATEGORIES (5)
  // ═══════════════════════════════════════

  const catLaptop = await prisma.assetCategory.create({
    data: { name: "Laptops", customFields: { warrantyPeriod: "months", brand: "text", RAM: "text" } },
  });

  const catFurniture = await prisma.assetCategory.create({
    data: { name: "Furniture", customFields: { material: "text", color: "text" } },
  });

  const catVehicle = await prisma.assetCategory.create({
    data: { name: "Vehicles", customFields: { registrationNumber: "text", fuelType: "text", mileage: "number" } },
  });

  const catMeetingRoom = await prisma.assetCategory.create({
    data: { name: "Meeting Rooms", customFields: { capacity: "number", hasProjector: "boolean", hasWhiteboard: "boolean" } },
  });

  const catNetworking = await prisma.assetCategory.create({
    data: { name: "Networking Equipment", customFields: { ports: "number", speed: "text" } },
  });

  console.log("📦 Created 5 asset categories");

  // ═══════════════════════════════════════
  // ASSETS (20 — mixed statuses)
  // ═══════════════════════════════════════

  const assets = await Promise.all([
    // Laptops (6)
    prisma.asset.create({
      data: {
        assetTag: "AF-0001", name: "MacBook Pro 16\"", categoryId: catLaptop.id,
        serialNumber: "SN-MBP-001", acquisitionDate: new Date("2024-01-15"),
        acquisitionCost: 189999, condition: "Good", location: "Floor 3, Desk A1",
        departmentId: engineering.id, status: AssetStatus.ALLOCATED,
      },
    }),
    prisma.asset.create({
      data: {
        assetTag: "AF-0002", name: "Dell XPS 15", categoryId: catLaptop.id,
        serialNumber: "SN-DELL-002", acquisitionDate: new Date("2024-02-20"),
        acquisitionCost: 145000, condition: "Good", location: "Floor 3, Desk B2",
        departmentId: engineering.id, status: AssetStatus.AVAILABLE,
      },
    }),
    prisma.asset.create({
      data: {
        assetTag: "AF-0003", name: "ThinkPad T14", categoryId: catLaptop.id,
        serialNumber: "SN-TP-003", acquisitionDate: new Date("2023-08-10"),
        acquisitionCost: 98000, condition: "Fair", location: "Floor 2, Desk C3",
        departmentId: marketing.id, status: AssetStatus.ALLOCATED,
      },
    }),
    prisma.asset.create({
      data: {
        assetTag: "AF-0004", name: "HP EliteBook 840", categoryId: catLaptop.id,
        serialNumber: "SN-HP-004", acquisitionDate: new Date("2023-06-05"),
        acquisitionCost: 112000, condition: "Good", location: "Floor 2, Desk D4",
        departmentId: marketing.id, status: AssetStatus.AVAILABLE,
      },
    }),
    prisma.asset.create({
      data: {
        assetTag: "AF-0005", name: "MacBook Air M3", categoryId: catLaptop.id,
        serialNumber: "SN-MBA-005", acquisitionDate: new Date("2024-05-12"),
        acquisitionCost: 134999, condition: "Good", location: "Floor 1, Desk E5",
        departmentId: operations.id, status: AssetStatus.UNDER_MAINTENANCE,
      },
    }),
    prisma.asset.create({
      data: {
        assetTag: "AF-0006", name: "Lenovo IdeaPad", categoryId: catLaptop.id,
        serialNumber: "SN-LEN-006", acquisitionDate: new Date("2022-03-18"),
        acquisitionCost: 65000, condition: "Poor", location: "Storage Room B",
        departmentId: operations.id, status: AssetStatus.RETIRED,
      },
    }),

    // Furniture (4)
    prisma.asset.create({
      data: {
        assetTag: "AF-0007", name: "Ergonomic Standing Desk", categoryId: catFurniture.id,
        acquisitionDate: new Date("2024-03-01"), acquisitionCost: 35000,
        condition: "Good", location: "Floor 3, Bay A",
        departmentId: engineering.id, status: AssetStatus.ALLOCATED,
      },
    }),
    prisma.asset.create({
      data: {
        assetTag: "AF-0008", name: "Herman Miller Aeron Chair", categoryId: catFurniture.id,
        acquisitionDate: new Date("2024-01-20"), acquisitionCost: 85000,
        condition: "Good", location: "Floor 3, Bay A",
        departmentId: engineering.id, status: AssetStatus.AVAILABLE,
      },
    }),
    prisma.asset.create({
      data: {
        assetTag: "AF-0009", name: "Conference Table (12-seater)", categoryId: catFurniture.id,
        acquisitionDate: new Date("2023-11-15"), acquisitionCost: 120000,
        condition: "Good", location: "Floor 4, Conference Room 1",
        departmentId: null, status: AssetStatus.AVAILABLE,
      },
    }),
    prisma.asset.create({
      data: {
        assetTag: "AF-0010", name: "Filing Cabinet (4-drawer)", categoryId: catFurniture.id,
        acquisitionDate: new Date("2022-07-10"), acquisitionCost: 12000,
        condition: "Fair", location: "Floor 1, Admin Area",
        departmentId: operations.id, status: AssetStatus.AVAILABLE,
      },
    }),

    // Vehicles (3)
    prisma.asset.create({
      data: {
        assetTag: "AF-0011", name: "Toyota Innova Crysta", categoryId: catVehicle.id,
        serialNumber: "MH-02-AB-1234", acquisitionDate: new Date("2023-04-15"),
        acquisitionCost: 2100000, condition: "Good", location: "Basement Parking, Slot P1",
        departmentId: operations.id, status: AssetStatus.ALLOCATED,
      },
    }),
    prisma.asset.create({
      data: {
        assetTag: "AF-0012", name: "Maruti Swift Dzire", categoryId: catVehicle.id,
        serialNumber: "MH-02-CD-5678", acquisitionDate: new Date("2022-09-20"),
        acquisitionCost: 850000, condition: "Fair", location: "Basement Parking, Slot P2",
        departmentId: operations.id, status: AssetStatus.AVAILABLE,
      },
    }),
    prisma.asset.create({
      data: {
        assetTag: "AF-0013", name: "Tata Nexon EV", categoryId: catVehicle.id,
        serialNumber: "MH-02-EF-9012", acquisitionDate: new Date("2024-06-01"),
        acquisitionCost: 1800000, condition: "Good", location: "Basement Parking, Slot P3",
        departmentId: operations.id, status: AssetStatus.LOST,
      },
    }),

    // Meeting Rooms (4 — all bookable)
    prisma.asset.create({
      data: {
        assetTag: "AF-0014", name: "Meeting Room A (Himalaya)", categoryId: catMeetingRoom.id,
        condition: "Good", location: "Floor 2, East Wing",
        isBookable: true, status: AssetStatus.AVAILABLE,
      },
    }),
    prisma.asset.create({
      data: {
        assetTag: "AF-0015", name: "Meeting Room B (Ganges)", categoryId: catMeetingRoom.id,
        condition: "Good", location: "Floor 3, West Wing",
        isBookable: true, status: AssetStatus.AVAILABLE,
      },
    }),
    prisma.asset.create({
      data: {
        assetTag: "AF-0016", name: "Board Room (Everest)", categoryId: catMeetingRoom.id,
        condition: "Good", location: "Floor 5, Executive Area",
        isBookable: true, status: AssetStatus.AVAILABLE,
      },
    }),
    prisma.asset.create({
      data: {
        assetTag: "AF-0017", name: "Training Room (Thar)", categoryId: catMeetingRoom.id,
        condition: "Good", location: "Floor 1, Training Center",
        isBookable: true, status: AssetStatus.UNDER_MAINTENANCE,
      },
    }),

    // Networking Equipment (3)
    prisma.asset.create({
      data: {
        assetTag: "AF-0018", name: "Cisco Catalyst 9300 Switch", categoryId: catNetworking.id,
        serialNumber: "SN-CISCO-018", acquisitionDate: new Date("2023-12-01"),
        acquisitionCost: 350000, condition: "Good", location: "Server Room, Rack 1",
        departmentId: engineering.id, status: AssetStatus.ALLOCATED,
      },
    }),
    prisma.asset.create({
      data: {
        assetTag: "AF-0019", name: "Ubiquiti UniFi AP", categoryId: catNetworking.id,
        serialNumber: "SN-UBNT-019", acquisitionDate: new Date("2024-02-15"),
        acquisitionCost: 15000, condition: "Good", location: "Floor 3, Ceiling Mount",
        departmentId: engineering.id, status: AssetStatus.AVAILABLE,
      },
    }),
    prisma.asset.create({
      data: {
        assetTag: "AF-0020", name: "APC Smart-UPS 3000VA", categoryId: catNetworking.id,
        serialNumber: "SN-APC-020", acquisitionDate: new Date("2023-07-20"),
        acquisitionCost: 85000, condition: "Good", location: "Server Room, Rack 2",
        departmentId: engineering.id, status: AssetStatus.DISPOSED,
      },
    }),
  ]);

  console.log("🖥️  Created 20 assets (mixed statuses)");

  // ═══════════════════════════════════════
  // ALLOCATIONS (5 active, 3 returned, 1 overdue)
  // ═══════════════════════════════════════

  // Active allocations
  await prisma.allocation.create({
    data: {
      assetId: assets[0].id, // MacBook Pro → Raj
      employeeId: employees[0].id,
      status: AllocationStatus.ACTIVE,
      allocatedAt: new Date("2024-06-01"),
      expectedReturnAt: new Date("2025-06-01"),
    },
  });

  await prisma.allocation.create({
    data: {
      assetId: assets[2].id, // ThinkPad → Meera
      employeeId: employees[3].id,
      status: AllocationStatus.ACTIVE,
      allocatedAt: new Date("2024-04-15"),
      expectedReturnAt: new Date("2025-04-15"),
    },
  });

  await prisma.allocation.create({
    data: {
      assetId: assets[6].id, // Standing Desk → Deepika
      employeeId: employees[1].id,
      status: AllocationStatus.ACTIVE,
      allocatedAt: new Date("2024-03-10"),
    },
  });

  await prisma.allocation.create({
    data: {
      assetId: assets[10].id, // Innova → Rohit
      employeeId: employees[6].id,
      status: AllocationStatus.ACTIVE,
      allocatedAt: new Date("2024-07-01"),
      expectedReturnAt: new Date("2024-12-31"),
    },
  });

  await prisma.allocation.create({
    data: {
      assetId: assets[17].id, // Cisco Switch → Arjun
      employeeId: employees[2].id,
      status: AllocationStatus.ACTIVE,
      allocatedAt: new Date("2024-01-20"),
    },
  });

  // Returned allocations (history)
  await prisma.allocation.create({
    data: {
      assetId: assets[1].id, // Dell XPS → was with Raj, returned
      employeeId: employees[0].id,
      status: AllocationStatus.RETURNED,
      allocatedAt: new Date("2023-06-01"),
      expectedReturnAt: new Date("2024-06-01"),
      returnedAt: new Date("2024-05-28"),
      conditionNotes: "Minor scratch on lid, otherwise good condition",
    },
  });

  await prisma.allocation.create({
    data: {
      assetId: assets[7].id, // Aeron Chair → was with Aditya, returned
      employeeId: employees[4].id,
      status: AllocationStatus.RETURNED,
      allocatedAt: new Date("2023-09-15"),
      returnedAt: new Date("2024-03-15"),
      conditionNotes: "Good condition, armrest slightly worn",
    },
  });

  await prisma.allocation.create({
    data: {
      assetId: assets[3].id, // HP EliteBook → was with Kavita, returned
      employeeId: employees[5].id,
      status: AllocationStatus.RETURNED,
      allocatedAt: new Date("2023-04-10"),
      expectedReturnAt: new Date("2024-04-10"),
      returnedAt: new Date("2024-04-08"),
      conditionNotes: "Battery health at 82%, otherwise functional",
    },
  });

  // Overdue allocation
  await prisma.allocation.create({
    data: {
      assetId: assets[11].id, // Dzire → Suresh, overdue
      employeeId: employees[8].id,
      status: AllocationStatus.ACTIVE,
      allocatedAt: new Date("2024-01-15"),
      expectedReturnAt: new Date("2024-06-15"),
      isOverdue: true,
    },
  });

  console.log("📋 Created 9 allocations (5 active, 3 returned, 1 overdue)");

  // ═══════════════════════════════════════
  // RESOURCE BOOKINGS (6)
  // ═══════════════════════════════════════

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  dayAfter.setHours(10, 0, 0, 0);

  await prisma.resourceBooking.createMany({
    data: [
      {
        assetId: assets[13].id, // Himalaya room
        userId: employees[0].id,
        startTime: new Date(tomorrow.getTime()),
        endTime: new Date(tomorrow.getTime() + 60 * 60 * 1000), // 1 hour
        status: BookingStatus.UPCOMING,
        notes: "Sprint planning meeting",
      },
      {
        assetId: assets[13].id, // Himalaya room
        userId: employees[3].id,
        startTime: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000),
        endTime: new Date(tomorrow.getTime() + 3 * 60 * 60 * 1000),
        status: BookingStatus.UPCOMING,
        notes: "Design review",
      },
      {
        assetId: assets[14].id, // Ganges room
        userId: deptHead1.id,
        startTime: new Date(tomorrow.getTime() + 4 * 60 * 60 * 1000),
        endTime: new Date(tomorrow.getTime() + 5 * 60 * 60 * 1000),
        status: BookingStatus.UPCOMING,
        notes: "1-on-1 with team lead",
      },
      {
        assetId: assets[15].id, // Board Room
        userId: admin.id,
        startTime: new Date(dayAfter.getTime()),
        endTime: new Date(dayAfter.getTime() + 2 * 60 * 60 * 1000),
        status: BookingStatus.UPCOMING,
        notes: "Quarterly review presentation",
      },
      {
        assetId: assets[14].id, // Ganges room — completed
        userId: employees[4].id,
        startTime: new Date("2024-07-01T10:00:00Z"),
        endTime: new Date("2024-07-01T11:00:00Z"),
        status: BookingStatus.COMPLETED,
        notes: "Marketing sync",
      },
      {
        assetId: assets[15].id, // Board Room — cancelled
        userId: employees[6].id,
        startTime: new Date("2024-07-05T14:00:00Z"),
        endTime: new Date("2024-07-05T15:30:00Z"),
        status: BookingStatus.CANCELLED,
        notes: "Ops planning — cancelled due to holiday",
      },
    ],
  });

  console.log("📅 Created 6 resource bookings");

  // ═══════════════════════════════════════
  // MAINTENANCE REQUESTS (5 — various statuses)
  // ═══════════════════════════════════════

  await prisma.maintenanceRequest.create({
    data: {
      assetId: assets[4].id, // MacBook Air — under maintenance
      raisedById: employees[6].id,
      issue: "Screen flickering intermittently, gets worse when lid is at certain angles",
      priority: Priority.HIGH,
      status: MaintenanceStatus.APPROVED,
    },
  });

  await prisma.maintenanceRequest.create({
    data: {
      assetId: assets[16].id, // Training Room — under maintenance
      raisedById: deptHead3.id,
      issue: "Projector lamp needs replacement, image is dim and yellow-tinted",
      priority: Priority.MEDIUM,
      status: MaintenanceStatus.TECHNICIAN_ASSIGNED,
      technicianId: employees[8].id,
    },
  });

  await prisma.maintenanceRequest.create({
    data: {
      assetId: assets[2].id, // ThinkPad — pending
      raisedById: employees[3].id,
      issue: "Keyboard key 'E' is not responsive, need replacement",
      priority: Priority.MEDIUM,
      status: MaintenanceStatus.PENDING,
    },
  });

  await prisma.maintenanceRequest.create({
    data: {
      assetId: assets[1].id, // Dell XPS — resolved
      raisedById: employees[0].id,
      issue: "Battery not charging past 50%",
      priority: Priority.HIGH,
      status: MaintenanceStatus.RESOLVED,
      technicianId: employees[8].id,
      resolvedAt: new Date("2024-06-20"),
      notes: "Battery replaced under warranty. New battery health: 100%",
    },
  });

  await prisma.maintenanceRequest.create({
    data: {
      assetId: assets[9].id, // Filing Cabinet
      raisedById: employees[7].id,
      issue: "Lock mechanism jammed, cannot open second drawer",
      priority: Priority.LOW,
      status: MaintenanceStatus.REJECTED,
      notes: "Cost of repair exceeds asset value. Recommend replacement.",
    },
  });

  console.log("🔧 Created 5 maintenance requests");

  // ═══════════════════════════════════════
  // TRANSFER REQUEST (1)
  // ═══════════════════════════════════════

  await prisma.transferRequest.create({
    data: {
      assetId: assets[0].id, // MacBook Pro — Raj → Deepika
      fromUserId: employees[0].id,
      toUserId: employees[1].id,
      status: "REQUESTED",
      reason: "Raj is moving to backend team, Deepika needs a high-spec machine for ML work",
    },
  });

  console.log("🔄 Created 1 transfer request");

  // ═══════════════════════════════════════
  // AUDIT CYCLE (1 active)
  // ═══════════════════════════════════════

  const auditCycle = await prisma.auditCycle.create({
    data: {
      name: "Q3 2024 Engineering Asset Audit",
      departmentId: engineering.id,
      startDate: new Date("2024-07-01"),
      endDate: new Date("2024-07-15"),
      status: AuditCycleStatus.OPEN,
    },
  });

  await prisma.auditAssignment.createMany({
    data: [
      { auditCycleId: auditCycle.id, auditorId: manager1.id },
      { auditCycleId: auditCycle.id, auditorId: deptHead1.id },
    ],
  });

  // Audit entries for engineering department assets
  const engineeringAssets = assets.filter((a) =>
    [assets[0].id, assets[1].id, assets[6].id, assets[7].id, assets[17].id, assets[18].id].includes(a.id)
  );

  for (const asset of engineeringAssets) {
    await prisma.auditEntry.create({
      data: {
        auditCycleId: auditCycle.id,
        assetId: asset.id,
        status: AuditEntryStatus.PENDING,
      },
    });
  }

  console.log("🔍 Created 1 audit cycle with 6 entries");

  // ═══════════════════════════════════════
  // SAMPLE NOTIFICATIONS (5)
  // ═══════════════════════════════════════

  await prisma.notification.createMany({
    data: [
      {
        userId: employees[0].id,
        type: "ASSET_ASSIGNED",
        message: "MacBook Pro 16\" (AF-0001) has been allocated to you",
        entityId: assets[0].id,
      },
      {
        userId: employees[3].id,
        type: "ASSET_ASSIGNED",
        message: "ThinkPad T14 (AF-0003) has been allocated to you",
        entityId: assets[2].id,
      },
      {
        userId: employees[0].id,
        type: "BOOKING_CONFIRMED",
        message: "Your booking for Meeting Room A (Himalaya) has been confirmed for tomorrow 9:00 AM",
        entityId: assets[13].id,
      },
      {
        userId: employees[6].id,
        type: "MAINTENANCE_APPROVED",
        message: "Your maintenance request for MacBook Air M3 (AF-0005) has been approved",
        entityId: assets[4].id,
      },
      {
        userId: employees[8].id,
        type: "OVERDUE_RETURN",
        message: "Maruti Swift Dzire (AF-0012) is overdue for return. Please return immediately.",
        entityId: assets[11].id,
        isRead: false,
      },
    ],
  });

  console.log("🔔 Created 5 sample notifications");

  // ═══════════════════════════════════════
  // ACTIVITY LOGS (5)
  // ═══════════════════════════════════════

  await prisma.activityLog.createMany({
    data: [
      {
        userId: manager1.id,
        action: "ASSET_ALLOCATED",
        entityType: "Asset",
        entityId: assets[0].id,
        metadata: { assetTag: "AF-0001", employeeName: "Raj Kumar" },
      },
      {
        userId: admin.id,
        action: "ASSET_CREATED",
        entityType: "Asset",
        entityId: assets[0].id,
        metadata: { assetTag: "AF-0001", assetName: "MacBook Pro 16\"" },
      },
      {
        userId: employees[6].id,
        action: "MAINTENANCE_RAISED",
        entityType: "Maintenance",
        entityId: assets[4].id,
        metadata: { assetTag: "AF-0005", issue: "Screen flickering" },
      },
      {
        userId: employees[0].id,
        action: "BOOKING_CREATED",
        entityType: "Booking",
        entityId: assets[13].id,
        metadata: { roomName: "Meeting Room A (Himalaya)", date: "tomorrow" },
      },
      {
        userId: employees[0].id,
        action: "TRANSFER_REQUESTED",
        entityType: "Transfer",
        entityId: assets[0].id,
        metadata: { from: "Raj Kumar", to: "Deepika Nair", assetTag: "AF-0001" },
      },
    ],
  });

  console.log("📝 Created 5 activity logs");

  // ═══════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════

  console.log("\n✅ Seed complete! Summary:");
  console.log("─────────────────────────────────");
  console.log("  Departments:    3");
  console.log("  Users:          16 (1 Admin, 2 Managers, 3 Heads, 10 Employees)");
  console.log("  Categories:     5");
  console.log("  Assets:         20 (mixed statuses)");
  console.log("  Allocations:    9 (5 active, 3 returned, 1 overdue)");
  console.log("  Bookings:       6");
  console.log("  Maintenance:    5");
  console.log("  Transfers:      1");
  console.log("  Audit Cycles:   1 (with 6 entries)");
  console.log("  Notifications:  5");
  console.log("  Activity Logs:  5");
  console.log("─────────────────────────────────");
  console.log("\n🔑 Login credentials (all users):");
  console.log("  Password: Password@123");
  console.log("  Admin:    admin@assetflow.com");
  console.log("  Manager:  anjali.manager@assetflow.com");
  console.log("  Dept Head: priya.head@assetflow.com");
  console.log("  Employee: raj@assetflow.com");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
