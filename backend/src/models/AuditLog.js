import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    actionType: { type: String, required: true },
    targetCollection: { type: String },
    targetId: { type: String },
    details: { type: String, required: true },
    ip: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("AuditLog", auditLogSchema);
