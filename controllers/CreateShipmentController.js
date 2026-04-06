// controllers/CreateShipmentController.js (Fixed version)
import CreateShipment from "../models/CreateShipment.js";

// Create Shipment
export const createShipment = async (req, res) => {
  try {
    const shipmentData = req.body;

    // Validate required fields
    if (!shipmentData.customerName || !shipmentData.customerEmail || !shipmentData.customerPhone) {
      return res.status(400).json({
        success: false,
        message: "Customer details are required"
      });
    }

    if (!shipmentData.pickupDate) {
      return res.status(400).json({
        success: false,
        message: "Pickup date is required"
      });
    }

    // Validate origin address
    if (!shipmentData.originAddress || 
        !shipmentData.originAddress.company ||
        !shipmentData.originAddress.contactName ||
        !shipmentData.originAddress.address1 ||
        !shipmentData.originAddress.city ||
        !shipmentData.originAddress.state ||
        !shipmentData.originAddress.zipCode ||
        !shipmentData.originAddress.phone ||
        !shipmentData.originAddress.email) {
      return res.status(400).json({
        success: false,
        message: "Complete origin address is required"
      });
    }

    // Validate destination address
    if (!shipmentData.destinationAddress || 
        !shipmentData.destinationAddress.company ||
        !shipmentData.destinationAddress.contactName ||
        !shipmentData.destinationAddress.address1 ||
        !shipmentData.destinationAddress.city ||
        !shipmentData.destinationAddress.state ||
        !shipmentData.destinationAddress.zipCode ||
        !shipmentData.destinationAddress.phone ||
        !shipmentData.destinationAddress.email) {
      return res.status(400).json({
        success: false,
        message: "Complete destination address is required"
      });
    }

    // Validate items
    if (!shipmentData.items || shipmentData.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one item is required"
      });
    }

    // Create shipment
    const shipment = new CreateShipment(shipmentData);
    await shipment.save();

    res.status(201).json({
      success: true,
      message: "Shipment created successfully",
      trackingId: shipment.trackingId,
      data: shipment
    });

  } catch (error) {
    console.error("Create Shipment Error:", error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: errors.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create shipment"
    });
  }
};

// Save as Draft
export const saveAsDraft = async (req, res) => {
  try {
    const shipmentData = req.body;
    
    // Set status as draft
    shipmentData.status = "draft";
    
    // Create shipment
    const shipment = new CreateShipment(shipmentData);
    await shipment.save();

    res.status(201).json({
      success: true,
      message: "Shipment saved as draft successfully",
      data: shipment
    });

  } catch (error) {
    console.error("Save Draft Error:", error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: errors.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || "Failed to save draft"
    });
  }
};

// Get all shipments
export const getAllShipments = async (req, res) => {
  try {
    const shipments = await CreateShipment.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: shipments.length,
      data: shipments
    });
  } catch (error) {
    console.error("Get Shipments Error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single shipment
export const getShipmentById = async (req, res) => {
  try {
    const shipment = await CreateShipment.findById(req.params.id);
    
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found"
      });
    }
    
    res.status(200).json({
      success: true,
      data: shipment
    });
  } catch (error) {
    console.error("Get Shipment Error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update shipment
export const updateShipment = async (req, res) => {
  try {
    const shipment = await CreateShipment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Shipment updated successfully",
      data: shipment
    });
  } catch (error) {
    console.error("Update Shipment Error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update shipment status
export const updateShipmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const shipment = await CreateShipment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: `Shipment status updated to ${status}`,
      data: shipment
    });
  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete shipment
export const deleteShipment = async (req, res) => {
  try {
    const shipment = await CreateShipment.findByIdAndDelete(req.params.id);
    
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Shipment deleted successfully"
    });
  } catch (error) {
    console.error("Delete Shipment Error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Track shipment by tracking ID
export const trackShipment = async (req, res) => {
  try {
    const shipment = await CreateShipment.findOne({ trackingId: req.params.trackingId });
    
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found"
      });
    }
    
    res.status(200).json({
      success: true,
      data: shipment
    });
  } catch (error) {
    console.error("Track Shipment Error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get shipment statistics
export const getShipmentStats = async (req, res) => {
  try {
    const total = await CreateShipment.countDocuments();
    const pending = await CreateShipment.countDocuments({ status: "pending" });
    const inTransit = await CreateShipment.countDocuments({ status: "in_transit" });
    const delivered = await CreateShipment.countDocuments({ status: "delivered" });
    const cancelled = await CreateShipment.countDocuments({ status: "cancelled" });
    
    res.status(200).json({
      success: true,
      data: {
        total,
        pending,
        inTransit,
        delivered,
        cancelled
      }
    });
  } catch (error) {
    console.error("Get Stats Error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get shipments by customer email
export const getShipmentsByCustomer = async (req, res) => {
  try {
    const shipments = await CreateShipment.find({ customerEmail: req.params.email }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: shipments.length,
      data: shipments
    });
  } catch (error) {
    console.error("Get Customer Shipments Error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};