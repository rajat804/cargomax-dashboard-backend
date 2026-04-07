// backend/models/VendorDirectory.js
import mongoose from "mongoose";

const vendorDirectorySchema = new mongoose.Schema(
  {
    vendorId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Vendor name is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: ["Transportation", "Courier", "Maritime", "Air Freight", "Rail Transport", "Trucking", "Warehousing", "Customs Broker", "Delivery", "Packaging", "Technology", "Fuel Supply", "Maintenance"],
      default: "Transportation",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Under Review", "Blacklisted"],
      default: "Active",
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    contactPerson: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    alternatePhone: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: {
        type: String,
        default: "India",
      },
    },
    gstNumber: {
      type: String,
      trim: true,
    },
    panNumber: {
      type: String,
      trim: true,
    },
    contractValue: {
      type: Number,
      min: 0,
      default: 0,
    },
    contractStartDate: {
      type: Date,
      required: true,
    },
    contractExpiry: {
      type: Date,
      required: true,
    },
    lastDelivery: {
      type: Date,
    },
    onTimeDelivery: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    qualityScore: {
      type: Number,
      min: 0,
      default: 0,
    },
    responseTime: {
      type: String,
      default: "2h",
    },
    paymentTerms: {
      type: String,
      enum: ["Net 15", "Net 30", "Net 45", "Net 60", "Advance Payment", "COD"],
      default: "Net 30",
    },
    tags: [{
      type: String,
      enum: ["International", "Domestic", "Premium", "Express", "Certified", "Eco-friendly", "Refrigerated", "Hazmat", "Bulk", "Same-day", "24/7 Support", "ISO Certified", "GST Registered"],
    }],
    notes: {
      type: String,
      default: "",
    },
    contracts: [{
      name: String,
      fileName: String,
      fileUrl: String,
      uploadedAt: Date,
    }],
    performanceHistory: [{
      month: String,
      onTimeDelivery: Number,
      qualityScore: Number,
      rating: Number,
    }],
    currency: {
      type: String,
      default: "INR",
    },
    createdBy: {
      type: String,
      default: "Admin",
    },
  },
  {
    timestamps: true,
  }
);

// Generate vendor ID before saving
vendorDirectorySchema.pre("save", async function () {
  if (!this.vendorId) {
    const prefix = "VND";
    const year = new Date().getFullYear().toString().slice(-2);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
    this.vendorId = `${prefix}-${year}${random}`;
  }
});

const VendorDirectory = mongoose.model("VendorDirectory", vendorDirectorySchema);

export default VendorDirectory;