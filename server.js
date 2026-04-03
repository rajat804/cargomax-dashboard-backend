import express from "express";
import cors from "cors";
import dotenv from "dotenv";
// import dotenv from "dotenv/config";
import connectDB from "./config/mongodb.js";
// Routes
import warehouseRoutes from "./routes/warehouseRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import shipmentRoutes from "./routes/shipmentRoutes.js";
import managerRoutes from "./routes/managerRoutes.js";
import createShipmentRoutes from "./routes/createShipmentRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import { promises as dns } from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);


dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

/* ==============================
   DATABASE
============================== */
connectDB();

/* ==============================
   CORS CONFIG
============================== */
const allowedOrigins = [
  "http://localhost:3000",
  "https://cargomax-tau.vercel.app",
  "https://cargomax-ten.vercel.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

// ✅ THIS handles preflight automatically (NO crash)
app.use(cors(corsOptions));

/* ==============================
   MIDDLEWARE
============================== */
app.use(express.json());

/* ==============================
   ROUTES
============================== */
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/createshipments', createShipmentRoutes);
app.use('/api/managers', managerRoutes);
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});



// ✅ Fixed: Proper error handling middleware
app.use((err, req, res, next) => {
  console.error('Global Error:', err);
  
  // Check if it's a multer error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum size is 10MB.'
    });
  }
  
  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});
/* ==============================
   TEST ROUTE
============================== */
app.get("/", (req, res) => {
  res.send("✅ API Working");
});

/* ==============================
   START SERVER
============================== */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
