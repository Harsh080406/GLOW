import mongoose from "mongoose";

const refundSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    studentRef: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
    reason: { type: String, required: true },
    amount: { type: Number, required: true },
    originalPaid: { type: Number },
    claimedAmount: { type: Number },
    refundAmount: { type: Number },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    remarks: { type: String },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    processedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Refund", refundSchema);
