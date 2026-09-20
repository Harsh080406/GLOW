import mongoose from "mongoose";

const busSchema = new mongoose.Schema(
  {
    registrationNumber: { type: String, required: true, unique: true },
    capacity: { type: Number, required: true, default: 40 },
    occupancy: { type: Number, default: 0 },
    fuelLevel: { type: Number, default: 100 },
    status: {
      type: String,
      enum: ["On Route", "Maintenance", "Idle", "Delayed"],
      default: "Idle",
    },
    fitnessCertExpiry: { type: Date },
    currentDriverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Bus", busSchema);
