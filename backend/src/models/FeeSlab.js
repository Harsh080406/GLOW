import mongoose from "mongoose";

const feeSlabSchema = new mongoose.Schema(
  {
    zone: { type: String, enum: ["A", "B", "C"], required: true },
    amount: { type: Number, required: true },
    semester: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("FeeSlab", feeSlabSchema);
