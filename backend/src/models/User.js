import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String },
    role: {
      type: String,
      required: true,
      enum: ["super_admin", "finance_admin", "driver", "transport_manager", "student"],
    },
    department: { type: String },
    phone: { type: String },
    avatar: { type: String },
    // Student specific fields
    busId: { type: String },
    routeId: { type: String },
    pickupStop: { type: String },
    passId: { type: String },
    passStatus: { type: String, enum: ["ACTIVE", "PENDING", "EXPIRED"], default: "ACTIVE" },
    totalFee: { type: Number, default: 15000 },
    paidFee: { type: Number, default: 0 },
    pendingFee: { type: Number, default: 15000 },
    feeStatus: { type: String, enum: ["PAID", "PARTIAL", "PENDING"], default: "PENDING" },
    // Driver specific fields
    assignedBus: { type: String },
    assignedRoute: { type: String },
    licenseNo: { type: String },
    rating: { type: Number, default: 4.8 },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
