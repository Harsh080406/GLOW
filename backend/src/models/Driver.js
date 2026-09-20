import mongoose from "mongoose";

const driverSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    licenseNumber: { type: String, required: true },
    assignedBusId: { type: mongoose.Schema.Types.ObjectId, ref: "Bus" },
    shiftTiming: { type: String, default: "07:00 AM - 06:30 PM" },
    safetyRating: { type: Number, default: 4.8 },
  },
  { timestamps: true }
);

export default mongoose.model("Driver", driverSchema);
