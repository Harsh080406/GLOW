import mongoose from "mongoose";

const maintenanceLogSchema = new mongoose.Schema(
  {
    busId: { type: mongoose.Schema.Types.ObjectId, ref: "Bus", required: true },
    serviceType: { type: String, required: true },
    cost: { type: Number, required: true },
    vendor: { type: String, required: true },
    status: { type: String, enum: ["In Progress", "Completed", "Pending"], default: "In Progress" },
  },
  { timestamps: true }
);

export default mongoose.model("MaintenanceLog", maintenanceLogSchema);
