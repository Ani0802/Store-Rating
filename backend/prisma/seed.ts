import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing records
  await prisma.rating.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();

  // Create hashed passwords
  const adminPasswordHash = await bcrypt.hash("AdminPass123!", 10);
  const userPasswordHash = await bcrypt.hash("UserPass123!", 10);
  const ownerPasswordHash = await bcrypt.hash("OwnerPass123!", 10);

  // 1. Seed Admin
  const admin = await prisma.user.create({
    data: {
      name: "System Administrator Account", // 28 chars (min 20, max 60)
      email: "admin@example.com",
      password: adminPasswordHash,
      address: "123 Admin Headquarter Boulevard, Suite 500",
      role: "ADMIN",
    },
  });
  console.log(`Seeded admin: ${admin.email}`);

  // 2. Seed Normal User
  const user = await prisma.user.create({
    data: {
      name: "Regular Customer Account", // 24 chars
      email: "user@example.com",
      password: userPasswordHash,
      address: "456 User Residential Street, Apartment 4B",
      role: "USER",
    },
  });
  console.log(`Seeded user: ${user.email}`);

  // 3. Seed Store Owner and Store
  const storeOwner = await prisma.user.create({
    data: {
      name: "Grand Plaza Store Owner", // 23 chars
      email: "owner@example.com",
      password: ownerPasswordHash,
      address: "789 Commercial Marketplace Avenue, Store 12",
      role: "STORE_OWNER",
    },
  });

  const store = await prisma.store.create({
    data: {
      name: "Grand Plaza Retail Outlet", // 25 chars
      email: "outlet@grandplaza.com",
      address: "789 Commercial Marketplace Avenue, Store 12",
      ownerId: storeOwner.id,
    },
  });
  console.log(`Seeded store owner & store: ${storeOwner.email} -> ${store.name}`);

  // 4. Create an additional store for ratings demonstration
  const anotherStoreOwner = await prisma.user.create({
    data: {
      name: "Oceanic Emporium Manager", // 24 chars
      email: "oceanic_owner@example.com",
      password: ownerPasswordHash,
      address: "101 Sea Breeze Boardwalk, Shop 3",
      role: "STORE_OWNER",
    },
  });

  const anotherStore = await prisma.store.create({
    data: {
      name: "Oceanic Emporium Store", // 23 chars
      email: "shop@oceanicemporium.com",
      address: "101 Sea Breeze Boardwalk, Shop 3",
      ownerId: anotherStoreOwner.id,
    },
  });
  console.log(`Seeded secondary store owner & store: ${anotherStoreOwner.email} -> ${anotherStore.name}`);

  // 5. Add a rating from user to the oceanic store
  await prisma.rating.create({
    data: {
      score: 4,
      userId: user.id,
      storeId: anotherStore.id,
    },
  });
  console.log("Seeded default ratings.");

  console.log("Database seeding finished successfully.");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
