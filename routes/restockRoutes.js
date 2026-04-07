// routes/restockRoutes.js
import express from "express";
import {
  createRestockRequest,
  getAllRestockRequests,
  getRestockRequestById,
  getRestockRequestByRequestId,
  updateRestockRequest,
  approveRestockRequest,
  rejectRestockRequest,
  markAsInTransit,
  markAsDelivered,
  deleteRestockRequest,
  bulkApproveRequests,
  bulkRejectRequests,
  getDashboardStats,
} from "../controllers/restockController.js";

const router = express.Router();

// Dashboard stats
router.get("/stats/dashboard", getDashboardStats);

// Bulk operations
router.post("/bulk-approve", bulkApproveRequests);
router.post("/bulk-reject", bulkRejectRequests);

// CRUD operations
router.post("/create", createRestockRequest);
router.get("/all", getAllRestockRequests);
router.get("/:id", getRestockRequestById);
router.get("/requestId/:requestId", getRestockRequestByRequestId);
router.put("/update/:id", updateRestockRequest);
router.delete("/delete/:id", deleteRestockRequest);

// Status update operations
router.put("/approve/:id", approveRestockRequest);
router.put("/reject/:id", rejectRestockRequest);
router.put("/in-transit/:id", markAsInTransit);
router.put("/delivered/:id", markAsDelivered);

export default router;