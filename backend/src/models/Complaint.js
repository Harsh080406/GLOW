import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    priority: {
      type: String,
      enum: ["HIGH", "MEDIUM", "LOW"],
      default: "MEDIUM",
    },
    status: {
      type: String,
      enum: ["PENDING", "IN_REVIEW", "RESOLVED"],
      default: "PENDING",
    },
    department: { type: String },
    resolutionNotes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Complaint", complaintSchema);
