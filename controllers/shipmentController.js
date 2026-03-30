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

// Update Shipment
export const updateShipment = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate warehouse
    if (updates.originWarehouse) {
      const warehouseExists = await Warehouse.findById(updates.originWarehouse);
      if (!warehouseExists) {
        return res.status(400).json({
          success: false,
          message: "Selected Warehouse not found"
        });
      }
    }

    // Validate vendor
    if (updates.destinationVendor) {
      const vendorExists = await Vendor.findById(updates.destinationVendor);
      if (!vendorExists) {
        return res.status(400).json({
          success: false,
          message: "Selected Vendor not found"
        });
      }
    }

    // Convert numbers
    if (updates.weight) updates.weight = Number(updates.weight);
    if (updates.items) updates.items = Number(updates.items);
    if (updates.value) updates.value = Number(updates.value);

    const shipment = await Shipment.findByIdAndUpdate(
      id,
      updates,
      {
        returnDocument: "after",   // ✅ replace new:true
        runValidators: true
      }
    )
      .populate("originWarehouse", "name code city state")
      .populate("destinationVendor", "companyName city state");

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
      message: error.message || "Failed to update shipment"
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

export const getSingleShipment = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id)
      .populate('originWarehouse', 'name code city state')
      .populate('destinationVendor', 'companyName');

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




export const deleteShipment = async (req, res) => {
  try {

    const shipment = await Shipment.findByIdAndDelete(req.params.id);

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