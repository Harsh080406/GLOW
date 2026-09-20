import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    enrollmentId: { type: String, required: true, unique: true },
    branch: { type: String, required: true },
    semester: { type: String, required: true },
    assignedStopId: { type: String },
    routeId: { type: mongoose.Schema.Types.ObjectId, ref: "Route" },
    guardianContact: { type: String },
  },
  { timestamps: true }
);

studentSchema.index({ routeId: 1 });

export default mongoose.model("Student", studentSchema);
