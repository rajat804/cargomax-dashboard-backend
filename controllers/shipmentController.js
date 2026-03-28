// controllers/shipmentController.js
import Shipment from '../models/Shipment.js';
import Warehouse from '../models/Warehouse.js';
import Vendor from '../models/Vendor.js';



// ✅ Get All Shipments (with populated data)
export const getAllShipments = async (req, res) => {
  try {
    const shipments = await Shipment.find()
      .populate('originWarehouse', 'name code city state')   // Warehouse details
      .populate('destinationVendor', 'companyName')          // Vendor name
      .sort({ createdAt: -1 });                              // Latest first

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


export const createShipment = async (req, res) => {
  try {
    const { 
      customer, 
      carrier, 
      originWarehouse, 
      destinationVendor, 
      type, 
      priority, 
      weight, 
      items, 
      value,
      notes 
    } = req.body;

    // Validation
    if (!customer || !carrier || !originWarehouse || !destinationVendor || !type || !priority) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields"
      });
    }

    const warehouseExists = await Warehouse.findById(originWarehouse);
    const vendorExists = await Vendor.findById(destinationVendor);

    if (!warehouseExists) {
      return res.status(400).json({ success: false, message: "Origin Warehouse not found" });
    }
    if (!vendorExists) {
      return res.status(400).json({ success: false, message: "Destination Vendor not found" });
    }

    const shipment = await Shipment.create({
      customer,
      carrier,
      originWarehouse,
      destinationVendor,
      type,
      priority,
      weight: Number(weight),
      items: Number(items),
      value: Number(value),
      notes: notes || ""
    });

    res.status(201).json({
      success: true,
      message: "Shipment created successfully",
      trackingId: shipment.trackingId,
      data: shipment
    });

  } catch (error) {
    console.error("Create Shipment Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create shipment"
    });
  }
};

export const getWarehouses = async (req, res) => {
  try {
    const warehouses = await Warehouse.find().select('name code city state');
    res.status(200).json({ success: true, data: warehouses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find().select('companyName');
    res.status(200).json({ success: true, data: vendors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};