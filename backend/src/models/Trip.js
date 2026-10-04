import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
  {
    busId: { type: mongoose.Schema.Types.ObjectId, ref: "Bus", required: true },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    routeId: { type: mongoose.Schema.Types.ObjectId, ref: "Route", required: true },
    status: {
      type: String,
      enum: ["NOT_STARTED", "ON_ROUTE", "PAUSED", "COMPLETED"],
      default: "NOT_STARTED",
    },
    startedAt: { type: Date },
    completedAt: { type: Date },
    occupancySnapshot: { type: Number, default: 0 },
    departureTime: { type: String },
    shiftType: { type: String, default: "regular" },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

tripSchema.index({ status: 1 });

export default mongoose.model("Trip", tripSchema);
