import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    gateway: {
      type: String,
      enum: ["UPI", "Card", "NetBanking", "Challan"],
      required: true,
    },
    status: { type: String, enum: ["COMPLETED", "PENDING", "REJECTED"], default: "COMPLETED" },
    txnRef: { type: String, required: true },
    attachmentUrl: { type: String },
    bankName: { type: String },
    rejectionReason: { type: String },
    paymentDate: { type: Date, default: Date.now },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

paymentSchema.index({ studentId: 1 });

export default mongoose.model("Payment", paymentSchema);
