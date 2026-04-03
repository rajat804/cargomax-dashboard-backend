import express from "express";
import {
  getAllInventory,
  getInventoryById,
  createInventory,
  updateInventory,
  deleteInventory,
  restockInventory,
  transferInventory,
  getInventoryHistory,
  getLowStockItems,
  getExpiringItems,
  getDashboardStats,
} from "../controllers/inventoryController.js";

const router = express.Router();

router.get("/all", getAllInventory);
router.get("/stats", getDashboardStats);
router.get("/low-stock", getLowStockItems);
router.get("/expiring", getExpiringItems);
router.get("/:id", getInventoryById);
router.get("/:id/history", getInventoryHistory);
router.post("/create", createInventory);
router.put("/update/:id", updateInventory);
router.delete("/delete/:id", deleteInventory);
router.post("/:id/restock", restockInventory);
router.post("/:id/transfer", transferInventory);

export default router;