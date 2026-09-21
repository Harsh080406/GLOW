import mongoose from "mongoose";

const stopNotificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    routeId: { type: mongoose.Schema.Types.ObjectId, ref: "Route", required: true },
    stopName: { type: String, required: true },
    minutesBefore: { type: Number, default: 10 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

stopNotificationSchema.index({ userId: 1, stopName: 1 });

export default mongoose.model("StopNotification", stopNotificationSchema);
