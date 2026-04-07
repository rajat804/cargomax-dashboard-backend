// backend/controllers/vendorDirectoryController.js
import VendorDirectory from "../models/VendorDirectory.js";

// Format currency in INR
const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// @desc    Update vendor (FIXED - using returnDocument instead of new)
export const updateVendor = async (req, res) => {
  try {
    const vendor = await VendorDirectory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: 'after', runValidators: true }  // ✅ Changed from 'new: true' to 'returnDocument: "after"'
    );
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Vendor updated successfully",
      data: vendor,
    });
  } catch (error) {
    console.error("Update Vendor Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update vendor rating (FIXED)
export const updateVendorRating = async (req, res) => {
  try {
    const { rating, onTimeDelivery, qualityScore } = req.body;
    
    const vendor = await VendorDirectory.findByIdAndUpdate(
      req.params.id,
      {
        rating,
        onTimeDelivery,
        qualityScore,
        $push: {
          performanceHistory: {
            month: new Date().toISOString().slice(0, 7),
            onTimeDelivery,
            qualityScore,
            rating,
          },
        },
      },
      { returnDocument: 'after', runValidators: true }  // ✅ Changed from 'new: true'
    );
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Vendor rating updated successfully",
      data: vendor,
    });
  } catch (error) {
    console.error("Update Rating Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Upload contract document (FIXED)
export const uploadContract = async (req, res) => {
  try {
    const { name, fileName, fileUrl } = req.body;
    
    const vendor = await VendorDirectory.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          contracts: {
            name,
            fileName,
            fileUrl,
            uploadedAt: new Date(),
          },
        },
      },
      { returnDocument: 'after', runValidators: true }  // ✅ Changed from 'new: true'
    );
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Contract uploaded successfully",
      data: vendor,
    });
  } catch (error) {
    console.error("Upload Contract Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete vendor
export const deleteVendor = async (req, res) => {
  try {
    const vendor = await VendorDirectory.findByIdAndDelete(req.params.id);
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Vendor deleted successfully",
    });
  } catch (error) {
    console.error("Delete Vendor Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Rest of the controller remains same...
export const getAllVendors = async (req, res) => {
  try {
    const { category, status, search, tab } = req.query;
    
    let filter = {};
    
    if (category && category !== "all") filter.category = category;
    if (status && status !== "all") filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { vendorId: { $regex: search, $options: "i" } },
        { contactPerson: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (tab && tab !== "all") {
      if (tab === "premium") filter.tags = { $in: ["Premium"] };
      else if (tab === "international") filter.tags = { $in: ["International"] };
      else if (tab === "domestic") filter.tags = { $in: ["Domestic"] };
    }
    
    const vendors = await VendorDirectory.find(filter).sort({ createdAt: -1 });
    
    const totalVendors = await VendorDirectory.countDocuments();
    const activeVendors = await VendorDirectory.countDocuments({ status: "Active" });
    const expiringSoon = await VendorDirectory.countDocuments({
      contractExpiry: { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
    });
    const avgRating = await VendorDirectory.aggregate([
      { $group: { _id: null, avg: { $avg: "$rating" } } }
    ]);
    
    const totalContractValue = await VendorDirectory.aggregate([
      { $group: { _id: null, total: { $sum: "$contractValue" } } }
    ]);
    
    res.status(200).json({
      success: true,
      count: vendors.length,
      data: vendors,
      stats: {
        total: totalVendors,
        active: activeVendors,
        expiringSoon: expiringSoon,
        avgRating: avgRating[0]?.avg || 0,
        totalContractValue: totalContractValue[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error("Get Vendors Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getVendorById = async (req, res) => {
  try {
    const vendor = await VendorDirectory.findById(req.params.id);
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }
    
    res.status(200).json({
      success: true,
      data: vendor,
    });
  } catch (error) {
    console.error("Get Vendor Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getVendorByVendorId = async (req, res) => {
  try {
    const vendor = await VendorDirectory.findOne({ vendorId: req.params.vendorId });
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }
    
    res.status(200).json({
      success: true,
      data: vendor,
    });
  } catch (error) {
    console.error("Get Vendor Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createVendor = async (req, res) => {
  try {
    const {
      name,
      category,
      status,
      contactPerson,
      email,
      phone,
      alternatePhone,
      location,
      address,
      gstNumber,
      panNumber,
      contractValue,
      contractStartDate,
      contractExpiry,
      paymentTerms,
      tags,
      notes,
    } = req.body;
    
    if (!name || !contactPerson || !email || !phone || !location || !contractStartDate || !contractExpiry) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }
    
    const vendor = await VendorDirectory.create({
      name,
      category: category || "Transportation",
      status: status || "Active",
      contactPerson,
      email,
      phone,
      alternatePhone: alternatePhone || "",
      location,
      address: address || {},
      gstNumber: gstNumber || "",
      panNumber: panNumber || "",
      contractValue: contractValue || 0,
      contractStartDate,
      contractExpiry,
      paymentTerms: paymentTerms || "Net 30",
      tags: tags || [],
      notes: notes || "",
      rating: 0,
      onTimeDelivery: 0,
      qualityScore: 0,
      responseTime: "2h",
      currency: "INR",
    });
    
    res.status(201).json({
      success: true,
      message: "Vendor created successfully",
      data: vendor,
    });
  } catch (error) {
    console.error("Create Vendor Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getVendorStats = async (req, res) => {
  try {
    const totalVendors = await VendorDirectory.countDocuments();
    const activeVendors = await VendorDirectory.countDocuments({ status: "Active" });
    const inactiveVendors = await VendorDirectory.countDocuments({ status: "Inactive" });
    const underReview = await VendorDirectory.countDocuments({ status: "Under Review" });
    const expiringSoon = await VendorDirectory.countDocuments({
      contractExpiry: { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
    });
    
    const categoryStats = await VendorDirectory.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);
    
    const ratingDistribution = await VendorDirectory.aggregate([
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $gte: ["$rating", 4.5] }, then: "4.5-5.0" },
                { case: { $gte: ["$rating", 4.0] }, then: "4.0-4.5" },
                { case: { $gte: ["$rating", 3.5] }, then: "3.5-4.0" },
                { case: { $gte: ["$rating", 3.0] }, then: "3.0-3.5" },
              ],
              default: "Below 3.0",
            },
          },
          count: { $sum: 1 },
        },
      },
    ]);
    
    const totalContractValue = await VendorDirectory.aggregate([
      { $group: { _id: null, total: { $sum: "$contractValue" } } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        total: totalVendors,
        active: activeVendors,
        inactive: inactiveVendors,
        underReview: underReview,
        expiringSoon: expiringSoon,
        totalContractValue: totalContractValue[0]?.total || 0,
        byCategory: categoryStats,
        ratingDistribution: ratingDistribution,
      },
    });
  } catch (error) {
    console.error("Get Vendor Stats Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getVendorsByCategory = async (req, res) => {
  try {
    const vendors = await VendorDirectory.find({ 
      category: req.params.category,
      status: "Active" 
    });
    
    res.status(200).json({
      success: true,
      count: vendors.length,
      data: vendors,
    });
  } catch (error) {
    console.error("Get Vendors By Category Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTopRatedVendors = async (req, res) => {
  try {
    const limit = parseInt(req.params.limit) || 5;
    const vendors = await VendorDirectory.find({ status: "Active" })
      .sort({ rating: -1 })
      .limit(limit);
    
    res.status(200).json({
      success: true,
      count: vendors.length,
      data: vendors,
    });
  } catch (error) {
    console.error("Get Top Rated Vendors Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};