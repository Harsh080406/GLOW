import mongoose from "mongoose";

const feeTransactionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    dept: { type: String },
    route: { type: String },
    amount: { type: Number, required: true },
    date: { type: String },
    method: { type: String, required: true },
    refNo: { type: String, required: true },
    status: { type: String, enum: ["COMPLETED", "PENDING", "FAILED"], default: "COMPLETED" },
    receiptId: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("FeeTransaction", feeTransactionSchema);
