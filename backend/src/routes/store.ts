import { Router, Response } from "express";
import prisma from "../utils/db";
import { AuthRequest, verifyToken, requireRole } from "../middleware/auth";

const router = Router();

// Apply auth middleware to all store owner routes
router.use(verifyToken);
router.use(requireRole("STORE_OWNER"));

// @route   GET /api/store/dashboard
// @desc    Get store owner dashboard (average rating, list of users who rated)
// @access  Private (Store Owner only)
router.get("/dashboard", async (req: AuthRequest, res: Response) => {
  try {
    const ownerId = req.user!.id;
    const { sortBy, sortOrder } = req.query;

    // Find the store owned by this user
    const store = await prisma.store.findUnique({
      where: { ownerId },
      include: {
        ratings: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                address: true,
              },
            },
          },
        },
      },
    });

    if (!store) {
      return res.status(404).json({ message: "Store not found for this account" });
    }

    const ratingCount = store.ratings.length;
    const totalScore = store.ratings.reduce((sum, r) => sum + r.score, 0);
    const averageRating = ratingCount > 0 ? Number((totalScore / ratingCount).toFixed(2)) : 0;

    // Map ratings to the required structure
    let submitters = store.ratings.map((rating) => ({
      ratingId: rating.id,
      score: rating.score,
      createdAt: rating.createdAt,
      name: rating.user.name,
      email: rating.user.email,
      address: rating.user.address,
    }));

    // Apply sorting
    const validSortFields = ["name", "email", "address", "score", "createdAt"];
    const sortField = validSortFields.includes(String(sortBy)) ? String(sortBy) : "createdAt";
    const order = sortOrder === "asc" ? 1 : -1;

    submitters.sort((a: any, b: any) => {
      if (a[sortField] < b[sortField]) return -1 * order;
      if (a[sortField] > b[sortField]) return 1 * order;
      return 0;
    });

    return res.json({
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        averageRating,
        ratingCount,
      },
      ratings: submitters,
    });
  } catch (error) {
    console.error("Store dashboard error:", error);
    return res.status(500).json({ message: "Server error retrieving store dashboard" });
  }
});

export default router;
