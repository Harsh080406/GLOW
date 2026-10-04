import mongoose from "mongoose";

const feeLedgerSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    studentRef: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
    zone: { type: String, enum: ["A", "B", "C"], required: true },
    totalFee: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    balanceDue: { type: Number, required: true },
    status: {
      type: String,
      enum: ["PAID", "PARTIAL", "OVERDUE"],
      default: "OVERDUE",
    },
    dueDate: { type: Date, required: true },
  },
  { timestamps: true }
);

feeLedgerSchema.index({ status: 1 });

export default mongoose.model("FeeLedger", feeLedgerSchema);
