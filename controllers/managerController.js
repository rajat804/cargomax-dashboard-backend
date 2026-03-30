// controllers/managerController.js
import Manager from '../models/Manager.js';
import Warehouse from '../models/Warehouse.js';

export const createManager = async (req, res) => {
  try {
    const { name, email, phone, warehouse, position, salary, address } = req.body;

    const warehouseExists = await Warehouse.findById(warehouse);
    if (!warehouseExists) {
      return res.status(400).json({ success: false, message: "Warehouse not found" });
    }

    const manager = await Manager.create({
      name,
      email,
      phone,
      warehouse,
      position,
      salary,
      address
    });

    res.status(201).json({
      success: true,
      message: "Manager added successfully",
      data: manager
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getManagers = async (req, res) => {
  try {
    const managers = await Manager.find()
      .populate('warehouse', 'name code city')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: managers.length,
      data: managers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};