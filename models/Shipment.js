import mongoose from "mongoose";

const shipmentSchema = new mongoose.Schema(
  {
    shipmentNumber: {
      type: String,
      unique: true
    },

    trackingId: {
      type: String,
      unique: true
    },

    customer: {
      type: String,
      required: true
    },

    carrier: {
      type: String,
      required: true
    },

    originWarehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true
    },

    destinationVendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true
    },

    type: {
      type: String,
      enum: ["road", "air", "sea", "rail"],
      required: true
    },

    priority: {
      type: String,
      enum: ["express", "standard", "economy"],
      required: true
    },

    weight: Number,
    items: Number,
    value: Number,

    status: {
      type: String,
      enum: ["pending", "in-transit", "delivered", "cancelled"],
      default: "pending"
    },

    notes: String
  },
  { timestamps: true }
);


/* AUTO GENERATE shipmentNumber + trackingId */

shipmentSchema.pre("save", async function () {

  if (!this.shipmentNumber) {
    const count = await mongoose.model("Shipment").countDocuments();
    this.shipmentNumber = `SHP-${String(count + 1).padStart(5, "0")}`;
  }

  if (!this.trackingId) {
    const randomNum = Math.floor(10000000 + Math.random() * 90000000);
    this.trackingId = `TRK${randomNum}`;
  }

});

export default mongoose.model("Shipment", shipmentSchema);