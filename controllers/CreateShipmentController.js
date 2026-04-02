import CreateShipment from "../models/CreateShipment.js";

// @desc    Create a new shipment
// @route   POST /api/shipments/create
export const createShipment = async (req, res) => {
  try {
    const shipmentData = {
      ...req.body,
      status: "pending",
    };

    const shipment = new CreateShipment(shipmentData);
    await shipment.save();

    res.status(201).json({
      success: true,
      message: "Shipment created successfully",
      data: shipment,
    });
  } catch (error) {
    console.error("Create shipment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create shipment",
      error: error.message,
    });
  }
};

// @desc    Get all shipments
// @route   GET /api/shipments/all
export const getAllShipments = async (req, res) => {
  try {
    const shipments = await CreateShipment.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: shipments.length,
      data: shipments,
    });
  } catch (error) {
    console.error("Get shipments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch shipments",
      error: error.message,
    });
  }
};

// @desc    Get single shipment by ID
// @route   GET /api/shipments/:id
export const getShipmentById = async (req, res) => {
  try {
    const shipment = await CreateShipment.findById(req.params.id);

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found",
      });
    }

    res.status(200).json({
      success: true,
      data: shipment,
    });
  } catch (error) {
    console.error("Get shipment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch shipment",
      error: error.message,
    });
  }
};

// @desc    Get shipment by tracking ID
// @route   GET /api/shipments/track/:trackingId
export const trackShipment = async (req, res) => {
  try {
    const shipment = await CreateShipment.findOne({ trackingId: req.params.trackingId });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found",
      });
    }

    res.status(200).json({
      success: true,
      data: shipment,
    });
  } catch (error) {
    console.error("Track shipment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to track shipment",
      error: error.message,
    });
  }
};

// @desc    Update shipment
// @route   PUT /api/shipments/update/:id
export const updateShipment = async (req, res) => {
  try {
    const shipment = await CreateShipment.findById(req.params.id);

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found",
      });
    }

    // Don't allow updates if shipment is already delivered or cancelled
    if (shipment.status === "delivered" || shipment.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: `Cannot update shipment that is ${shipment.status}`,
      });
    }

    const updatedShipment = await CreateShipment.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Shipment updated successfully",
      data: updatedShipment,
    });
  } catch (error) {
    console.error("Update shipment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update shipment",
      error: error.message,
    });
  }
};

// @desc    Update shipment status
// @route   PATCH /api/shipments/status/:id
export const updateShipmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["draft", "pending", "confirmed", "in_transit", "delivered", "cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const shipment = await CreateShipment.findById(req.params.id);

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found",
      });
    }

    shipment.status = status;
    await shipment.save();

    res.status(200).json({
      success: true,
      message: "Shipment status updated successfully",
      data: shipment,
    });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update shipment status",
      error: error.message,
    });
  }
};

// @desc    Delete shipment
// @route   DELETE /api/shipments/delete/:id
export const deleteShipment = async (req, res) => {
  try {
    const shipment = await CreateShipment.findById(req.params.id);

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found",
      });
    }

    await shipment.deleteOne();

    res.status(200).json({
      success: true,
      message: "Shipment deleted successfully",
    });
  } catch (error) {
    console.error("Delete shipment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete shipment",
      error: error.message,
    });
  }
};

// @desc    Save as draft
// @route   POST /api/shipments/draft
export const saveAsDraft = async (req, res) => {
  try {
    const shipmentData = {
      ...req.body,
      status: "draft",
    };

    const shipment = new CreateShipment(shipmentData);
    await shipment.save();

    res.status(201).json({
      success: true,
      message: "Shipment saved as draft",
      data: shipment,
    });
  } catch (error) {
    console.error("Save draft error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save draft",
      error: error.message,
    });
  }
};

// @desc    Get shipment statistics
// @route   GET /api/shipments/stats/all
export const getShipmentStats = async (req, res) => {
  try {
    const totalShipments = await CreateShipment.countDocuments();
    const pendingShipments = await CreateShipment.countDocuments({ status: "pending" });
    const inTransitShipments = await CreateShipment.countDocuments({ status: "in_transit" });
    const deliveredShipments = await CreateShipment.countDocuments({ status: "delivered" });
    const cancelledShipments = await CreateShipment.countDocuments({ status: "cancelled" });
    
    const totalValue = await CreateShipment.aggregate([
      { $group: { _id: null, total: { $sum: "$totalValue" } } }
    ]);
    
    const totalWeight = await CreateShipment.aggregate([
      { $group: { _id: null, total: { $sum: "$totalWeight" } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalShipments,
        pending: pendingShipments,
        inTransit: inTransitShipments,
        delivered: deliveredShipments,
        cancelled: cancelledShipments,
        totalValue: totalValue[0]?.total || 0,
        totalWeight: totalWeight[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
      error: error.message,
    });
  }
};

// @desc    Get shipments by customer email
// @route   GET /api/shipments/customer/:email
export const getShipmentsByCustomer = async (req, res) => {
  try {
    const shipments = await CreateShipment.find({ customerEmail: req.params.email }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: shipments.length,
      data: shipments,
    });
  } catch (error) {
    console.error("Get customer shipments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customer shipments",
      error: error.message,
    });
  }
};