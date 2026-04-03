import mongoose from "mongoose";

const inventoryHistorySchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
      required: true,
    },
    sku: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      enum: ["restock", "adjustment", "transfer", "sale", "disposal", "clearance"],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    previousQuantity: {
      type: Number,
      required: true,
    },
    newQuantity: {
      type: Number,
      required: true,
    },
    reference: {
      type: String,
      trim: true,
    },
    performedBy: {
      type: String,
      trim: true,
      default: "System",
    },
    notes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "completed",
    },
  },
  {
    timestamps: true,
  }
);

const InventoryHistory = mongoose.model("InventoryHistory", inventoryHistorySchema);
export default InventoryHistory;