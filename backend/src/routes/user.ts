import { Router, Response } from "express";
import prisma from "../utils/db";
import { AuthRequest, verifyToken, requireRole } from "../middleware/auth";
import { ratingSchema, updateRatingSchema } from "../utils/validation";

const router = Router();

// Apply auth middleware to all user routes
router.use(verifyToken);
router.use(requireRole("USER"));

// @route   GET /api/user/stores
// @desc    Get all stores with average ratings, user's rating, search & sorting
// @access  Private (User only)
router.get("/stores", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, address, sortBy, sortOrder } = req.query;

    const whereClause: any = {};
    if (name) {
      whereClause.name = { contains: String(name) };
    }
    if (address) {
      whereClause.address = { contains: String(address) };
    }

    // Fetch stores along with their ratings
    const stores = await prisma.store.findMany({
      where: whereClause,
      include: {
        ratings: true,
      },
    });

    // Format list: Calculate average and locate current user's rating
    let formattedStores = stores.map((store) => {
      const ratingCount = store.ratings.length;
      const totalScore = store.ratings.reduce((sum, r) => sum + r.score, 0);
      const averageRating = ratingCount > 0 ? Number((totalScore / ratingCount).toFixed(2)) : 0;
      
      const userRatingRecord = store.ratings.find((r) => r.userId === userId);
      const userRating = userRatingRecord ? userRatingRecord.score : null;
      const userRatingId = userRatingRecord ? userRatingRecord.id : null;

      return {
        id: store.id,
        name: store.name,
        address: store.address,
        averageRating,
        ratingCount,
        userRating,
        userRatingId,
        createdAt: store.createdAt,
      };
    });

    // Apply sorting
    const validSortFields = ["name", "address", "averageRating"];
    const sortField = validSortFields.includes(String(sortBy)) ? String(sortBy) : "name";
    const order = sortOrder === "desc" ? -1 : 1;

    formattedStores.sort((a: any, b: any) => {
      if (a[sortField] < b[sortField]) return -1 * order;
      if (a[sortField] > b[sortField]) return 1 * order;
      return 0;
    });

    return res.json(formattedStores);
  } catch (error) {
    console.error("Get stores for user error:", error);
    return res.status(500).json({ message: "Server error retrieving stores" });
  }
});

// @route   POST /api/user/ratings
// @desc    Submit a rating for a store (1 to 5)
// @access  Private (User only)
router.post("/ratings", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const parseResult = ratingSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: parseResult.error.flatten().fieldErrors 
      });
    }

    const { score, storeId } = parseResult.data;

    // Check if store exists
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    // Check if rating already exists from this user for this store
    const existingRating = await prisma.rating.findUnique({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
    });

    if (existingRating) {
      return res.status(400).json({ 
        message: "You have already rated this store. Please modify your existing rating instead.",
        ratingId: existingRating.id
      });
    }

    // Submit rating
    const rating = await prisma.rating.create({
      data: {
        score,
        userId,
        storeId,
      },
    });

    return res.status(201).json({
      message: "Rating submitted successfully",
      rating,
    });
  } catch (error) {
    console.error("Submit rating error:", error);
    return res.status(500).json({ message: "Server error submitting rating" });
  }
});

// @route   PUT /api/user/ratings/:id
// @desc    Modify a submitted rating (1 to 5)
// @access  Private (User only)
router.put("/ratings/:id", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const parseResult = updateRatingSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: parseResult.error.flatten().fieldErrors 
      });
    }

    const { score } = parseResult.data;

    // Check if rating exists and belongs to this user
    const rating = await prisma.rating.findUnique({
      where: { id },
    });

    if (!rating) {
      return res.status(404).json({ message: "Rating not found" });
    }

    if (rating.userId !== userId) {
      return res.status(403).json({ message: "Access denied. You cannot modify this rating." });
    }

    // Update rating
    const updatedRating = await prisma.rating.update({
      where: { id },
      data: { score },
    });

    return res.json({
      message: "Rating updated successfully",
      rating: updatedRating,
    });
  } catch (error) {
    console.error("Update rating error:", error);
    return res.status(500).json({ message: "Server error updating rating" });
  }
});

export default router;
