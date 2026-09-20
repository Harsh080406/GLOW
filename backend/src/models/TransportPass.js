import mongoose from "mongoose";

const transportPassSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    routeId: { type: mongoose.Schema.Types.ObjectId, ref: "Route", required: true },
    zone: { type: String, enum: ["A", "B", "C"], required: true },
    status: {
      type: String,
      enum: ["ACTIVE", "EXPIRED", "PENDING_FEE", "BLOCKED"],
      default: "ACTIVE",
    },
    validUntil: { type: Date, required: true },
    signedPayload: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("TransportPass", transportPassSchema);
