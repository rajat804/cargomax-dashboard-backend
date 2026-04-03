import mongoose from "mongoose";

const inventoryItemSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["Electronics", "Clothing", "Food & Beverage", "Automotive", "Home Goods"],
      required: true,
    },
    warehouse: {
      type: String,
      required: true,
      trim: true,
    },
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    reorderPoint: {
      type: Number,
      required: true,
      min: 0,
      default: 50,
    },
    description: {
      type: String,
      trim: true,
    },
    storageLocation: {
      type: String,
      trim: true,
    },
    expiryDate: {
      type: Date,
    },
    trackExpiry: {
      type: Boolean,
      default: false,
    },
    supplier: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "discontinued", "clearance", "expired"],
      default: "active",
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for total value
inventoryItemSchema.virtual("totalValue").get(function () {
  return (this.quantity || 0) * (this.unitPrice || 0);
});

// Virtual for stock level
inventoryItemSchema.virtual("stockLevel").get(function () {
  if (this.quantity === 0) return "Out of Stock";
  if (this.quantity < this.reorderPoint) return "Low Stock";
  if (this.quantity > this.reorderPoint * 3) return "Overstock";
  return "In Stock";
});

inventoryItemSchema.pre("save", function () {
  this.lastUpdated = new Date();
});

// Ensure virtuals are included in JSON
inventoryItemSchema.set("toJSON", { virtuals: true });
inventoryItemSchema.set("toObject", { virtuals: true });

const Inventory = mongoose.model("Inventory", inventoryItemSchema);
export default Inventory;