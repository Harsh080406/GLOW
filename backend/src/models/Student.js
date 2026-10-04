import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    enrollmentId: { type: String, required: true, unique: true },
    branch: { type: String, required: true },
    semester: { type: String, required: true },
    assignedStopId: { type: String },
    routeId: { type: mongoose.Schema.Types.ObjectId, ref: "Route" },
    assignedBusId: { type: mongoose.Schema.Types.ObjectId, ref: "Bus" },
    feeStatus: { type: String, enum: ["Paid", "Pending", "Waived"], default: "Paid" },
    passStatus: { type: String, enum: ["ACTIVE", "EXPIRED", "PENDING_FEE", "BLOCKED"], default: "ACTIVE" },
    guardianContact: { type: String },
  },
  { timestamps: true }
);

studentSchema.index({ routeId: 1 });

export default mongoose.model("Student", studentSchema);
