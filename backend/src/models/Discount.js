import mongoose from "mongoose";

const discountSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    waiverPercent: { type: Number, required: true },
    discountedAmount: { type: Number, required: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["ACTIVE", "REVOKED"], default: "ACTIVE" },
  },
  { timestamps: true }
);

export default mongoose.model("Discount", discountSchema);
