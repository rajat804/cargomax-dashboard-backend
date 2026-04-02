// models/CreateShipment.js
import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  company: { type: String, required: true, trim: true },
  contactName: { type: String, required: true, trim: true },
  address1: { type: String, required: true, trim: true },
  address2: { type: String, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  zipCode: { type: String, required: true, trim: true },
  country: { type: String, required: true, default: "US", trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
});

const itemDimensionsSchema = new mongoose.Schema({
  length: { type: Number, required: true, default: 0, min: 0 },
  width: { type: Number, required: true, default: 0, min: 0 },
  height: { type: Number, required: true, default: 0, min: 0 },
});

const shipmentItemSchema = new mongoose.Schema({
  description: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  weight: { type: Number, required: true, min: 0, default: 0 },
  dimensions: { type: itemDimensionsSchema, required: true },
  value: { type: Number, required: true, min: 0, default: 0 },
  category: {
    type: String,
    enum: ["general", "electronics", "clothing", "books", "food", "medical", "automotive"],
    default: "general",
  },
  hazardous: { type: Boolean, default: false },
});

const createShipmentSchema = new mongoose.Schema(
  {
    trackingId: { type: String, unique: true },
    shipmentType: {
      type: String,
      enum: ["standard", "document", "freight", "bulk"],
      required: true,
      default: "standard",
    },
    priority: {
      type: String,
      enum: ["standard", "express", "overnight"],
      required: true,
      default: "standard",
    },
    pickupDate: { type: Date, required: true },
    deliveryDate: { type: Date },
    originAddress: { type: addressSchema, required: true },
    destinationAddress: { type: addressSchema, required: true },
    items: { type: [shipmentItemSchema], default: [] },
    specialInstructions: { type: String, trim: true },
    insuranceRequired: { type: Boolean, default: false },
    signatureRequired: { type: Boolean, default: false },
    temperatureControlled: { type: Boolean, default: false },
    fragile: { type: Boolean, default: false },
    carrier: { type: String, enum: ["fedex", "ups", "dhl", "usps", "cargomax"] },
    service: { type: String, enum: ["ground", "air", "express", "overnight", "same-day"] },
    estimatedCost: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["draft", "pending", "confirmed", "in_transit", "delivered", "cancelled"],
      default: "draft",
    },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, lowercase: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    totalWeight: { type: Number, default: 0 },
    totalValue: { type: Number, default: 0 },
    totalItems: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ====================== ALL PRE-SAVE HOOKS AS ASYNC (Recommended for Mongoose 8/9) ======================

createShipmentSchema.pre("save", async function () {
  // Calculate totals
  if (!this.items || this.items.length === 0) {
    this.totalItems = 0;
    this.totalWeight = 0;
    this.totalValue = 0;
    return;
  }

  this.totalItems = this.items.length;
  this.totalWeight = this.items.reduce(
    (sum, item) => sum + (item.weight || 0) * (item.quantity || 0),
    0
  );
  this.totalValue = this.items.reduce(
    (sum, item) => sum + (item.value || 0) * (item.quantity || 0),
    0
  );
});

createShipmentSchema.pre("save", async function () {
  // Generate trackingId if not present
  if (!this.trackingId) {
    const prefix = "SHP";
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    this.trackingId = `${prefix}-${timestamp}-${random}`;
  }
});

const CreateShipment = mongoose.model("CreateShipment", createShipmentSchema);

export default CreateShipment;