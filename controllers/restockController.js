// controllers/restockController.js
import RestockRequest from "../models/RestockRequest.js";

// Format currency in INR
const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// @desc    Create a new restock request
// @route   POST /api/restock/create
// @access  Public
export const createRestockRequest = async (req, res) => {
  try {
    const {
      itemName,
      warehouse,
      currentStock,
      minThreshold,
      requestedQuantity,
      unitPrice,
      priority,
      requestedBy,
      expectedDelivery,
      vendor,
      notes,
    } = req.body;

    // Validation
    if (!itemName || !warehouse || !requestedQuantity || !unitPrice || !requestedBy || !expectedDelivery || !vendor) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    // Calculate total cost
    const totalCost = requestedQuantity * unitPrice;

    const restockRequest = await RestockRequest.create({
      itemName,
      warehouse,
      currentStock: currentStock || 0,
      minThreshold: minThreshold || 0,
      requestedQuantity,
      unitPrice,
      totalCost,
      priority: priority || "Medium",
      requestedBy,
      expectedDelivery,
      vendor,
      notes: notes || "",
      status: "Pending Approval",
    });

    res.status(201).json({
      success: true,
      message: "Restock request created successfully",
      data: restockRequest,
    });
  } catch (error) {
    console.error("Create Restock Request Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create restock request",
    });
  }
};

// @desc    Get all restock requests
// @route   GET /api/restock/all
// @access  Public
export const getAllRestockRequests = async (req, res) => {
  try {
    const { status, priority, warehouse, search } = req.query;
    
    let filter = {};
    
    if (status && status !== "all") filter.status = status;
    if (priority && priority !== "all") filter.priority = priority;
    if (warehouse && warehouse !== "all") filter.warehouse = warehouse;
    if (search) {
      filter.$or = [
        { itemName: { $regex: search, $options: "i" } },
        { requestId: { $regex: search, $options: "i" } },
        { warehouse: { $regex: search, $options: "i" } },
        { vendor: { $regex: search, $options: "i" } },
      ];
    }
    
    const requests = await RestockRequest.find(filter).sort({ createdAt: -1 });
    
    // Calculate statistics
    const pendingCount = await RestockRequest.countDocuments({ status: "Pending Approval" });
    const approvedCount = await RestockRequest.countDocuments({ status: "Approved" });
    const inTransitCount = await RestockRequest.countDocuments({ status: "In Transit" });
    const deliveredCount = await RestockRequest.countDocuments({ status: "Delivered" });
    const criticalCount = await RestockRequest.countDocuments({ priority: "Critical" });
    
    const pendingValue = await RestockRequest.aggregate([
      { $match: { status: "Pending Approval" } },
      { $group: { _id: null, total: { $sum: "$totalCost" } } }
    ]);
    
    const approvedValue = await RestockRequest.aggregate([
      { $match: { status: { $in: ["Approved", "In Transit"] } } },
      { $group: { _id: null, total: { $sum: "$totalCost" } } }
    ]);
    
    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
      stats: {
        pending: pendingCount,
        approved: approvedCount,
        inTransit: inTransitCount,
        delivered: deliveredCount,
        critical: criticalCount,
        pendingValue: pendingValue[0]?.total || 0,
        approvedValue: approvedValue[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error("Get Restock Requests Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single restock request by ID
// @route   GET /api/restock/:id
// @access  Public
export const getRestockRequestById = async (req, res) => {
  try {
    const request = await RestockRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Restock request not found",
      });
    }
    
    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.error("Get Restock Request Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get restock request by request ID
// @route   GET /api/restock/requestId/:requestId
// @access  Public
export const getRestockRequestByRequestId = async (req, res) => {
  try {
    const request = await RestockRequest.findOne({ requestId: req.params.requestId });
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Restock request not found",
      });
    }
    
    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.error("Get Restock Request Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update restock request
// @route   PUT /api/restock/update/:id
// @access  Public
export const updateRestockRequest = async (req, res) => {
  try {
    const {
      itemName,
      warehouse,
      currentStock,
      minThreshold,
      requestedQuantity,
      unitPrice,
      priority,
      requestedBy,
      expectedDelivery,
      vendor,
      notes,
      status,
    } = req.body;
    
    const updateData = {};
    
    if (itemName) updateData.itemName = itemName;
    if (warehouse) updateData.warehouse = warehouse;
    if (currentStock !== undefined) updateData.currentStock = currentStock;
    if (minThreshold !== undefined) updateData.minThreshold = minThreshold;
    if (requestedQuantity) updateData.requestedQuantity = requestedQuantity;
    if (unitPrice) updateData.unitPrice = unitPrice;
    if (priority) updateData.priority = priority;
    if (requestedBy) updateData.requestedBy = requestedBy;
    if (expectedDelivery) updateData.expectedDelivery = expectedDelivery;
    if (vendor) updateData.vendor = vendor;
    if (notes !== undefined) updateData.notes = notes;
    if (status) updateData.status = status;
    
    // Recalculate total cost if quantity or price changed
    if (requestedQuantity || unitPrice) {
      const newQuantity = requestedQuantity || (await RestockRequest.findById(req.params.id)).requestedQuantity;
      const newPrice = unitPrice || (await RestockRequest.findById(req.params.id)).unitPrice;
      updateData.totalCost = newQuantity * newPrice;
    }
    
    const request = await RestockRequest.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: 'after', runValidators: true }
    );
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Restock request not found",
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Restock request updated successfully",
      data: request,
    });
  } catch (error) {
    console.error("Update Restock Request Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Approve restock request
// @route   PUT /api/restock/approve/:id
// @access  Public
export const approveRestockRequest = async (req, res) => {
  try {
    const { approvalNotes, approvedBy } = req.body;
    
    const request = await RestockRequest.findByIdAndUpdate(
      req.params.id,
      {
        status: "Approved",
        approvalNotes: approvalNotes || "",
        approvedBy: approvedBy || "Admin",
        approvedAt: new Date(),
      },
      { returnDocument: 'after', runValidators: true }
    );
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Restock request not found",
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Restock request approved successfully",
      data: request,
    });
  } catch (error) {
    console.error("Approve Restock Request Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Reject restock request
// @route   PUT /api/restock/reject/:id
// @access  Public
export const rejectRestockRequest = async (req, res) => {
  try {
    const { rejectionReason, approvedBy } = req.body;
    
    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }
    
    const request = await RestockRequest.findByIdAndUpdate(
      req.params.id,
      {
        status: "Rejected",
        rejectionReason: rejectionReason,
        approvedBy: approvedBy || "Admin",
        approvedAt: new Date(),
      },
      { returnDocument: 'after', runValidators: true }
    );
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Restock request not found",
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Restock request rejected",
      data: request,
    });
  } catch (error) {
    console.error("Reject Restock Request Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Mark as In Transit
// @route   PUT /api/restock/in-transit/:id
// @access  Public
export const markAsInTransit = async (req, res) => {
  try {
    const { trackingNumber } = req.body;
    
    const request = await RestockRequest.findByIdAndUpdate(
      req.params.id,
      {
        status: "In Transit",
        trackingNumber: trackingNumber || "",
        shippedAt: new Date(),
      },
      { returnDocument: 'after', runValidators: true }
    );
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Restock request not found",
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Restock request marked as In Transit",
      data: request,
    });
  } catch (error) {
    console.error("Mark In Transit Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Mark as Delivered
// @route   PUT /api/restock/delivered/:id
// @access  Public
export const markAsDelivered = async (req, res) => {
  try {
    const request = await RestockRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Restock request not found",
      });
    }
    
    // Update stock
    const newStock = request.currentStock + request.requestedQuantity;
    
    const updatedRequest = await RestockRequest.findByIdAndUpdate(
      req.params.id,
      {
        status: "Delivered",
        deliveredAt: new Date(),
        currentStock: newStock,
      },
      { returnDocument: 'after', runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: "Restock request marked as Delivered. Stock updated.",
      data: updatedRequest,
    });
  } catch (error) {
    console.error("Mark Delivered Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete restock request
// @route   DELETE /api/restock/delete/:id
// @access  Public
export const deleteRestockRequest = async (req, res) => {
  try {
    const request = await RestockRequest.findByIdAndDelete(req.params.id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Restock request not found",
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Restock request deleted successfully",
    });
  } catch (error) {
    console.error("Delete Restock Request Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Bulk approve restock requests
// @route   POST /api/restock/bulk-approve
// @access  Public
export const bulkApproveRequests = async (req, res) => {
  try {
    const { requestIds, approvalNotes, approvedBy } = req.body;
    
    if (!requestIds || requestIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No request IDs provided",
      });
    }
    
    const result = await RestockRequest.updateMany(
      { _id: { $in: requestIds }, status: "Pending Approval" },
      {
        status: "Approved",
        approvalNotes: approvalNotes || "",
        approvedBy: approvedBy || "Admin",
        approvedAt: new Date(),
      }
    );
    
    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} requests approved successfully`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Bulk Approve Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Bulk reject restock requests
// @route   POST /api/restock/bulk-reject
// @access  Public
export const bulkRejectRequests = async (req, res) => {
  try {
    const { requestIds, rejectionReason, approvedBy } = req.body;
    
    if (!requestIds || requestIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No request IDs provided",
      });
    }
    
    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }
    
    const result = await RestockRequest.updateMany(
      { _id: { $in: requestIds }, status: "Pending Approval" },
      {
        status: "Rejected",
        rejectionReason: rejectionReason,
        approvedBy: approvedBy || "Admin",
        approvedAt: new Date(),
      }
    );
    
    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} requests rejected`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Bulk Reject Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/restock/stats/dashboard
// @access  Public
export const getDashboardStats = async (req, res) => {
  try {
    const totalRequests = await RestockRequest.countDocuments();
    const pendingRequests = await RestockRequest.countDocuments({ status: "Pending Approval" });
    const approvedRequests = await RestockRequest.countDocuments({ status: "Approved" });
    const inTransitRequests = await RestockRequest.countDocuments({ status: "In Transit" });
    const deliveredRequests = await RestockRequest.countDocuments({ status: "Delivered" });
    const rejectedRequests = await RestockRequest.countDocuments({ status: "Rejected" });
    const criticalRequests = await RestockRequest.countDocuments({ priority: "Critical" });
    
    const pendingValue = await RestockRequest.aggregate([
      { $match: { status: "Pending Approval" } },
      { $group: { _id: null, total: { $sum: "$totalCost" } } }
    ]);
    
    const approvedValue = await RestockRequest.aggregate([
      { $match: { status: { $in: ["Approved", "In Transit"] } } },
      { $group: { _id: null, total: { $sum: "$totalCost" } } }
    ]);
    
    const totalValue = await RestockRequest.aggregate([
      { $group: { _id: null, total: { $sum: "$totalCost" } } }
    ]);
    
    // Get unique warehouses
    const warehouses = await RestockRequest.distinct("warehouse");
    
    res.status(200).json({
      success: true,
      data: {
        total: totalRequests,
        pending: pendingRequests,
        approved: approvedRequests,
        inTransit: inTransitRequests,
        delivered: deliveredRequests,
        rejected: rejectedRequests,
        critical: criticalRequests,
        pendingValue: pendingValue[0]?.total || 0,
        approvedValue: approvedValue[0]?.total || 0,
        totalValue: totalValue[0]?.total || 0,
        warehouses: warehouses,
      },
    });
  } catch (error) {
    console.error("Get Dashboard Stats Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};