import Inventory from "../models/Inventory.js";
import InventoryHistory from "../models/InventoryHistory.js";

// Get all inventory items
export const getAllInventory = async (req, res) => {
  try {
    const items = await Inventory.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single inventory item
export const getInventoryById = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }
    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create new inventory item
export const createInventory = async (req, res) => {
  try {
    const { sku, name, category, warehouse, quantity, unitPrice, reorderPoint, description, storageLocation, expiryDate, trackExpiry, supplier } = req.body;

    // Check if SKU already exists
    const existingItem = await Inventory.findOne({ sku });
    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: "SKU already exists",
      });
    }

    const item = new Inventory({
      sku,
      name,
      category,
      warehouse,
      quantity: quantity || 0,
      unitPrice: unitPrice || 0,
      reorderPoint: reorderPoint || 50,
      description,
      storageLocation,
      expiryDate,
      trackExpiry: trackExpiry || false,
      supplier,
    });

    await item.save();

    // Create history record
    await InventoryHistory.create({
      itemId: item._id,
      sku: item.sku,
      action: "restock",
      quantity: item.quantity,
      previousQuantity: 0,
      newQuantity: item.quantity,
      reference: "Initial stock creation",
      performedBy: "System",
      notes: "Item created in inventory",
      status: "completed",
    });

    res.status(201).json({
      success: true,
      message: "Inventory item created successfully",
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update inventory item
export const updateInventory = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    const previousQuantity = item.quantity;
    const updatedItem = await Inventory.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastUpdated: Date.now() },
      {  returnDocument: "after", runValidators: true }
    );

    // Create history if quantity changed
    if (previousQuantity !== updatedItem.quantity) {
      await InventoryHistory.create({
        itemId: updatedItem._id,
        sku: updatedItem.sku,
        action: "adjustment",
        quantity: Math.abs(updatedItem.quantity - previousQuantity),
        previousQuantity,
        newQuantity: updatedItem.quantity,
        reference: "Manual adjustment",
        performedBy: req.body.performedBy || "System",
        notes: req.body.notes || "Item details updated",
        status: "completed",
      });
    }

    res.status(200).json({
      success: true,
      message: "Inventory item updated successfully",
      data: updatedItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Restock inventory
export const restockInventory = async (req, res) => {
  try {
    const { quantity, unitCost, supplier, purchaseOrder, notes } = req.body;
    const item = await Inventory.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid quantity is required",
      });
    }

    const previousQuantity = item.quantity;
    item.quantity += quantity;
    if (unitCost && unitCost > 0) item.unitPrice = unitCost;
    if (supplier) item.supplier = supplier;
    await item.save();

    await InventoryHistory.create({
      itemId: item._id,
      sku: item.sku,
      action: "restock",
      quantity: quantity,
      previousQuantity,
      newQuantity: item.quantity,
      reference: purchaseOrder || `PO-${Date.now()}`,
      performedBy: req.body.performedBy || "System",
      notes: notes || `Restocked ${quantity} units`,
      status: "completed",
    });

    res.status(200).json({
      success: true,
      message: "Item restocked successfully",
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Transfer inventory
export const transferInventory = async (req, res) => {
  try {
    const { quantity, toWarehouse, reason, priority, notes } = req.body;
    const item = await Inventory.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid quantity is required",
      });
    }

    if (item.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: "Insufficient quantity available for transfer",
      });
    }

    const previousQuantity = item.quantity;
    item.quantity -= quantity;
    await item.save();

    await InventoryHistory.create({
      itemId: item._id,
      sku: item.sku,
      action: "transfer",
      quantity: quantity,
      previousQuantity,
      newQuantity: item.quantity,
      reference: `TR-${Date.now()}`,
      performedBy: req.body.performedBy || "System",
      notes: `Transferred ${quantity} units to ${toWarehouse}. Reason: ${reason}. Priority: ${priority}. ${notes || ""}`,
      status: "completed",
    });

    res.status(200).json({
      success: true,
      message: "Item transferred successfully",
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete inventory item
export const deleteInventory = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    await item.deleteOne();
    res.status(200).json({
      success: true,
      message: "Inventory item deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get inventory history
export const getInventoryHistory = async (req, res) => {
  try {
    const history = await InventoryHistory.find({ itemId: req.params.id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get low stock items
export const getLowStockItems = async (req, res) => {
  try {
    const items = await Inventory.find({
      $expr: { $lt: ["$quantity", "$reorderPoint"] },
      quantity: { $gt: 0 },
    });
    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get expiring items
export const getExpiringItems = async (req, res) => {
  try {
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);

    const items = await Inventory.find({
      expiryDate: { $lte: ninetyDaysFromNow, $gte: new Date() },
      trackExpiry: true,
    });
    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const totalItems = await Inventory.countDocuments();
    const lowStockItems = await Inventory.countDocuments({
      $expr: { $lt: ["$quantity", "$reorderPoint"] },
      quantity: { $gt: 0 },
    });
    const outOfStockItems = await Inventory.countDocuments({ quantity: 0 });
    
    const totalValueResult = await Inventory.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ["$quantity", "$unitPrice"] } },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalItems,
        lowStockItems,
        outOfStockItems,
        totalValue: totalValueResult[0]?.total || 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};