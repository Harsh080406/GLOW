import mongoose from "mongoose";

const emergencyEventSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    busId: { type: String },
    routeId: { type: String },
    driver: { type: String },
    driverPhone: { type: String },
    studentsOnboard: { type: Number, default: 0 },
    location: { type: String, required: true },
    time: { type: String },
    status: { type: String, enum: ["ACTIVE", "MONITORING", "RESOLVED"], default: "ACTIVE" },
    notes: { type: String },
    severity: { type: String, enum: ["Low", "Medium", "High", "Critical"], default: "Medium" },
    reportedBy: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("EmergencyEvent", emergencyEventSchema);
