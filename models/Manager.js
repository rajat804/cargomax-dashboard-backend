// models/Manager.js
import mongoose from 'mongoose';

const managerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true
  },
  warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: true
  },
  position: {
    type: String,
    enum: ['Warehouse Manager', 'Assistant Manager', 'Shift Supervisor', 'Operations Manager'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'on-leave'],
    default: 'active'
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  salary: {
    type: Number
  },
  address: String,
  emergencyContact: {
    name: String,
    phone: String
  },
  photo: String  // Cloudinary URL
}, { 
  timestamps: true 
});

export default mongoose.model('Manager', managerSchema);