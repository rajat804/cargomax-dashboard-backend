import mongoose from 'mongoose';

const warehouseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Warehouse name is required'],
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Warehouse code is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  address: {
    type: String,
    required: [true, 'Address is required']
  },
  city: {
    type: String,
    required: [true, 'City is required']
  },
  state: {
    type: String,
    required: [true, 'State is required']
  },
  zip: {
    type: String,
    required: [true, 'ZIP code is required']
  },
  type: {
    type: String,
    enum: ['distribution', 'storage', 'fulfillment', 'cross-dock', 'cold-storage'],
    required: true
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: 0
  },
  phone: String,
  email: {
    type: String,
    match: [/.+\@.+\..+/, 'Please enter a valid email']
  },
  manager: String
}, { 
  timestamps: true 
});

export default mongoose.model('Warehouse', warehouseSchema);