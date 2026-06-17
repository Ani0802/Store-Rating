import { Router, Response } from "express";
import * as bcrypt from "bcryptjs";
import prisma from "../utils/db";
import { AuthRequest, verifyToken, requireRole } from "../middleware/auth";
import { adminCreateUserSchema, adminCreateStoreSchema } from "../utils/validation";

const router = Router();

// Apply auth middleware to all admin routes
router.use(verifyToken);
router.use(requireRole("ADMIN"));

// @route   GET /api/admin/dashboard
// @desc    Get system statistics
// @access  Private (Admin only)
router.get("/dashboard", async (req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalStores = await prisma.store.count();
    const totalRatings = await prisma.rating.count();

    return res.json({
      totalUsers,
      totalStores,
      totalRatings,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return res.status(500).json({ message: "Server error fetching dashboard stats" });
  }
});

// @route   POST /api/admin/users
// @desc    Add new normal user or admin user
// @access  Private (Admin only)
router.post("/users", async (req: AuthRequest, res: Response) => {
  try {
    const parseResult = adminCreateUserSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: parseResult.error.flatten().fieldErrors 
      });
    }

    const { name, email, password, address, role } = parseResult.data;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        address,
        role,
      },
    });

    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        address: newUser.address,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Create user error:", error);
    return res.status(500).json({ message: "Server error creating user" });
  }
});

// @route   GET /api/admin/users
// @desc    Get list of normal and admin users with sorting and filtering
// @access  Private (Admin only)
router.get("/users", async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, address, role, sortBy, sortOrder } = req.query;

    // Build filter object
    const whereClause: any = {};

    if (name) {
      whereClause.name = { contains: String(name) };
    }
    if (email) {
      whereClause.email = { contains: String(email) };
    }
    if (address) {
      whereClause.address = { contains: String(address) };
    }
    if (role) {
      whereClause.role = String(role);
    }

    // Sorting field map
    const validSortFields = ["name", "email", "address", "role", "createdAt"];
    const sortField = validSortFields.includes(String(sortBy)) ? String(sortBy) : "createdAt";
    const order = sortOrder === "asc" ? "asc" : "desc";

    const users = await prisma.user.findMany({
      where: whereClause,
      orderBy: {
        [sortField]: order,
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
      },
    });

    return res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    return res.status(500).json({ message: "Server error retrieving users" });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get details of a specific user. Include average rating if store owner.
// @access  Private (Admin only)
router.get("/users/:id", async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        store: {
          include: {
            ratings: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let averageRating = null;
    let ratingCount = 0;

    if (user.role === "STORE_OWNER" && user.store) {
      const storeRatings = user.store.ratings;
      ratingCount = storeRatings.length;
      if (ratingCount > 0) {
        const totalScore = storeRatings.reduce((sum, r) => sum + r.score, 0);
        averageRating = Number((totalScore / ratingCount).toFixed(2));
      }
    }

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
      createdAt: user.createdAt,
      store: user.store
        ? {
            id: user.store.id,
            name: user.store.name,
            email: user.store.email,
            address: user.store.address,
            averageRating,
            ratingCount,
          }
        : null,
    });
  } catch (error) {
    console.error("Get user details error:", error);
    return res.status(500).json({ message: "Server error retrieving user details" });
  }
});

// @route   POST /api/admin/stores
// @desc    Add new store. Automatically creates a STORE_OWNER user.
// @access  Private (Admin only)
router.post("/stores", async (req: AuthRequest, res: Response) => {
  try {
    const parseResult = adminCreateStoreSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: parseResult.error.flatten().fieldErrors 
      });
    }

    const { storeName, storeEmail, storeAddress, ownerName, ownerEmail, ownerPassword } = parseResult.data;

    // Check if store email or owner email already exists
    const existingOwnerEmail = await prisma.user.findUnique({
      where: { email: ownerEmail },
    });
    if (existingOwnerEmail) {
      return res.status(400).json({ message: "Owner email is already registered" });
    }

    const existingStoreEmail = await prisma.store.findUnique({
      where: { email: storeEmail },
    });
    if (existingStoreEmail) {
      return res.status(400).json({ message: "Store email is already registered" });
    }

    // Hash owner password
    const hashedPassword = await bcrypt.hash(ownerPassword, 10);

    // Create user and store inside transaction
    const result = await prisma.$transaction(async (tx) => {
      const ownerUser = await tx.user.create({
        data: {
          name: ownerName,
          email: ownerEmail,
          password: hashedPassword,
          address: storeAddress, // Assume owner address is same as store address
          role: "STORE_OWNER",
        },
      });

      const store = await tx.store.create({
        data: {
          name: storeName,
          email: storeEmail,
          address: storeAddress,
          ownerId: ownerUser.id,
        },
      });

      return { ownerUser, store };
    });

    return res.status(201).json({
      message: "Store and Store Owner created successfully",
      store: result.store,
      owner: {
        id: result.ownerUser.id,
        name: result.ownerUser.name,
        email: result.ownerUser.email,
        role: result.ownerUser.role,
      },
    });
  } catch (error) {
    console.error("Create store error:", error);
    return res.status(500).json({ message: "Server error creating store" });
  }
});

// @route   GET /api/admin/stores
// @desc    Get list of stores with average rating, filtering, and sorting
// @access  Private (Admin only)
router.get("/stores", async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, address, sortBy, sortOrder } = req.query;

    const whereClause: any = {};
    if (name) {
      whereClause.name = { contains: String(name) };
    }
    if (email) {
      whereClause.email = { contains: String(email) };
    }
    if (address) {
      whereClause.address = { contains: String(address) };
    }

    // Fetch stores with their ratings
    const stores = await prisma.store.findMany({
      where: whereClause,
      include: {
        ratings: true,
      },
    });

    // Map and compute average rating
    let formattedStores = stores.map((store) => {
      const ratingCount = store.ratings.length;
      const totalScore = store.ratings.reduce((sum, r) => sum + r.score, 0);
      const averageRating = ratingCount > 0 ? Number((totalScore / ratingCount).toFixed(2)) : 0;
      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        averageRating,
        ratingCount,
        createdAt: store.createdAt,
      };
    });

    // Apply sorting
    const validSortFields = ["name", "email", "address", "averageRating", "createdAt"];
    const sortField = validSortFields.includes(String(sortBy)) ? String(sortBy) : "createdAt";
    const order = sortOrder === "asc" ? 1 : -1;

    formattedStores.sort((a: any, b: any) => {
      if (a[sortField] < b[sortField]) return -1 * order;
      if (a[sortField] > b[sortField]) return 1 * order;
      return 0;
    });

    return res.json(formattedStores);
  } catch (error) {
    console.error("Get stores error:", error);
    return res.status(500).json({ message: "Server error retrieving stores" });
  }
});

export default router;
