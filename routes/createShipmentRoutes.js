// routes/CreateShipmentRoutes.js
import express from "express";
import {
  createShipment,
  getAllShipments,
  getShipmentById,
  trackShipment,
  updateShipment,
  updateShipmentStatus,
  deleteShipment,
  saveAsDraft,
  getShipmentStats,
  getShipmentsByCustomer,
} from "../controllers/CreateShipmentController.js";

const router = express.Router();

router.post("/create", createShipment);
router.post("/draft", saveAsDraft);
router.get("/all", getAllShipments);
router.get("/stats", getShipmentStats);
router.get("/:id", getShipmentById);
router.get("/track/:trackingId", trackShipment);
router.put("/update/:id", updateShipment);
router.patch("/status/:id", updateShipmentStatus);
router.delete("/delete/:id", deleteShipment);
router.get("/customer/:email", getShipmentsByCustomer);

export default router;