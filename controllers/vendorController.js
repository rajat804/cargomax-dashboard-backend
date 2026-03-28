import Vendor from '../models/Vendor.js';
import cloudinary from '../config/cloudinary.js';
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "vendors", resource_type: "auto" },
      (error, result) => {
        if (error) reject(error);
        else resolve({
          url: result.secure_url,
          publicId: result.public_id,
          filename: file.originalname,
          mimetype: file.mimetype,
          size: file.size
        });
      }
    );
    stream.end(file.buffer);
  });
};

// ✅ FIXED: No 'next' parameter
export const createVendor = async (req, res) => {
  try {
    if (!req.body.formData) {
      return res.status(400).json({ success: false, message: "Form data is required" });
    }

    const vendorData = JSON.parse(req.body.formData);
    const files = req.files || [];

    // Upload files
    const uploadedDocuments = [];
    for (const file of files) {
      try {
        const result = await uploadToCloudinary(file);
        uploadedDocuments.push(result);
      } catch (err) {
        console.error("Upload failed:", file.originalname);
      }
    }

    // Save to database
    const vendor = await Vendor.create({
      ...vendorData,
      documents: uploadedDocuments
    });

    res.status(201).json({
      success: true,
      message: "Vendor added successfully",
      data: vendor
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

export const getVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find().sort({ createdAt: -1 });
    res.json({ success: true, data: vendors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ success: false, message: "Vendor not found" });
    res.json({ success: true, data: vendor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export { upload };