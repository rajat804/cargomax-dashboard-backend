// models/RestockRequest.js
import mongoose from "mongoose";

const restockRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      unique: true,
    },
    itemName: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
    },
    warehouse: {
      type: String,
      required: [true, "Warehouse name is required"],
      trim: true,
    },
    currentStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    minThreshold: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    requestedQuantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    totalCost: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["Pending Approval", "Approved", "In Transit", "Delivered", "Rejected", "Cancelled"],
      default: "Pending Approval",
    },
    priority: {
      type: String,
      enum: ["Critical", "High", "Medium", "Low"],
      default: "Medium",
    },
    requestedBy: {
      type: String,
      required: true,
      trim: true,
    },
    requestDate: {
      type: Date,
      default: Date.now,
    },
    expectedDelivery: {
      type: Date,
      required: true,
    },
    vendor: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    approvalNotes: {
      type: String,
      trim: true,
      default: "",
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: "",
    },
    approvedBy: {
      type: String,
      trim: true,
    },
    approvedAt: {
      type: Date,
    },
    shippedAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    trackingNumber: {
      type: String,
      trim: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
  },
  {
    timestamps: true,
  }
);

// Generate request ID before saving
restockRequestSchema.pre("save", async function () {
  if (!this.requestId) {
    const prefix = "RST";
    const year = new Date().getFullYear().toString().slice(-2);
    const month = (new Date().getMonth() + 1).toString().padStart(2, "0");
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    this.requestId = `${prefix}-${year}${month}-${random}`;
  }
});

// Calculate total cost in INR before saving
restockRequestSchema.pre("save", function () {
  this.totalCost = this.requestedQuantity * this.unitPrice;
});

// Update stock levels when delivered
restockRequestSchema.methods.updateStockOnDelivery = function() {
  this.currentStock += this.requestedQuantity;
  return this.currentStock;
};

const RestockRequest = mongoose.model("RestockRequest", restockRequestSchema);

export default RestockRequest;