import mongoose from "mongoose";

const busSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    regNo: { type: String, required: true, unique: true },
    model: { type: String, required: true },
    capacity: { type: Number, required: true, default: 40 },
    occupied: { type: Number, default: 0 },
    driver: { type: String },
    driverPhone: { type: String },
    route: { type: String },
    status: { type: String, enum: ["On Route", "Delayed", "Maintenance", "Idle"], default: "Idle" },
    speed: { type: String, default: "0 km/h" },
    eta: { type: String, default: "--" },
    fuelPercent: { type: Number, default: 100 },
    isEV: { type: Boolean, default: false },
    gpsStatus: { type: String, enum: ["Online", "Offline"], default: "Online" },
    maintenance: { type: String, default: "Good" },
    insuranceExpiry: { type: String },
    fitnessExpiry: { type: String },
    rcExpiry: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Bus", busSchema);
