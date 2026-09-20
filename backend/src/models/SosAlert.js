import mongoose from "mongoose";

const sosAlertSchema = new mongoose.Schema(
  {
    raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    status: {
      type: String,
      enum: ["ACTIVE", "DISPATCHED", "RESOLVED"],
      default: "ACTIVE",
    },
    resolvedNotes: { type: String },
  },
  { timestamps: true }
);

sosAlertSchema.index({ status: 1 });

export default mongoose.model("SosAlert", sosAlertSchema);
