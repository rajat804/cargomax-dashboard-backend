import mongoose from "mongoose";

/* =========================
   Document Schema
========================= */
const documentSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    filename: { type: String },
    mimetype: { type: String },
    size: { type: Number },
  },
  { _id: false }
);

/* =========================
   Vendor Schema
========================= */
const vendorSchema = new mongoose.Schema(
  {
    // Basic Information
    companyName: { type: String, required: true, trim: true },
    vendorId: { type: String, unique: true, sparse: true },
    businessType: { type: String, default: "" },
    category: { type: String, default: "" },
    website: { type: String, default: "" },
    description: { type: String, default: "" },

    // Contact Information
    primaryContactName: { type: String, required: true, trim: true },
    primaryContactTitle: { type: String, default: "" },
    primaryContactEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    primaryContactPhone: { type: String, required: true, trim: true },

    secondaryContactName: { type: String, default: "" },
    secondaryContactEmail: { type: String, default: "" },
    secondaryContactPhone: { type: String, default: "" },

    // Address
    streetAddress: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, default: "" },
    zipCode: { type: String, default: "" },
    country: { type: String, default: "USA" },

    // Business Details
    taxId: { type: String, default: "" },
    businessLicense: { type: String, default: "" },
    yearEstablished: { type: String, default: "" },
    employeeCount: { type: String, default: "" },
    annualRevenue: { type: String, default: "" },

    // Services & Capabilities
    services: [{ type: String }],
    specializations: [{ type: String }],
    coverage: [{ type: String }],
    capacity: { type: String, default: "" },

    // Financial & Contract
    paymentTerms: { type: String, default: "" },
    currency: { type: String, default: "USD" },
    creditLimit: { type: String, default: "" },
    insuranceProvider: { type: String, default: "" },
    insuranceCoverage: { type: String, default: "" },

    // Compliance & Certifications
    certifications: [{ type: String }],
    complianceStandards: [{ type: String }],

    // Performance & Rating
    initialRating: { type: String, default: "" },
    riskLevel: { type: String, default: "" },

    // Additional
    notes: { type: String, default: "" },
    tags: [{ type: String }],
    preferredCommunication: { type: String, default: "" },
    timeZone: { type: String, default: "" },

    // Documents
    documents: [documentSchema],
  },
  { timestamps: true }
);

/* =========================
   Auto Generate Vendor ID
========================= */
vendorSchema.pre("save", async function () {
  try {
    if (!this.vendorId && this.isNew) {
      const lastVendor = await mongoose
        .model("Vendor")
        .findOne()
        .sort({ createdAt: -1 });

      let nextNumber = 1;

      if (lastVendor && lastVendor.vendorId) {
        const lastNumber = parseInt(lastVendor.vendorId.split("-")[1]);
        nextNumber = lastNumber + 1;
      }

      this.vendorId = `VND-${String(nextNumber).padStart(4, "0")}`;
    }
  } catch (error) {
    throw error;
  }
});

/* =========================
   Export Model
========================= */
const Vendor = mongoose.model("Vendor", vendorSchema);

export default Vendor;