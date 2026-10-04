import mongoose from "mongoose";

const discountSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    studentRef: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
    category: { type: String, default: "Merit Scholarship" },
    reason: { type: String },
    waiverPercent: { type: Number, required: true },
    discountedAmount: { type: Number, required: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["ACTIVE", "REVOKED"], default: "ACTIVE" },
  },
  { timestamps: true }
);

export default mongoose.model("Discount", discountSchema);
