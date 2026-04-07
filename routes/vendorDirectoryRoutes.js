// backend/routes/vendorDirectoryRoutes.js
import express from "express";
import {
  getAllVendors,
  getVendorById,
  getVendorByVendorId,
  createVendor,
  updateVendor,
  deleteVendor,
  updateVendorRating,
  getVendorStats,
  uploadContract,
  getVendorsByCategory,
  getTopRatedVendors,
} from "../controllers/vendorDirectoryController.js";

const router = express.Router();

// Dashboard stats
router.get("/stats/dashboard", getVendorStats);

// Get top rated vendors
router.get("/top-rated/:limit", getTopRatedVendors);

// Get vendors by category
router.get("/category/:category", getVendorsByCategory);

// CRUD operations
router.get("/all", getAllVendors);
router.get("/:id", getVendorById);
router.get("/vendorId/:vendorId", getVendorByVendorId);
router.post("/create", createVendor);
router.put("/update/:id", updateVendor);
router.delete("/delete/:id", deleteVendor);

// Rating update
router.put("/rating/:id", updateVendorRating);

// Contract upload
router.post("/:id/contract", uploadContract);

export default router;