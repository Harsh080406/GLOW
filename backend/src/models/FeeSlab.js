import mongoose from "mongoose";

const feeSlabSchema = new mongoose.Schema(
  {
    name: { type: String },
    type: { type: String, default: "Annual" },
    zone: { type: String, enum: ["A", "B", "C", "Zone A", "Zone B", "Zone C"], required: true },
    amount: { type: Number, required: true },
    semester: { type: String, default: "Fall 2026" },
    dueDate: { type: String, default: "15 Sep 2026" },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true }
);

export default mongoose.model("FeeSlab", feeSlabSchema);
