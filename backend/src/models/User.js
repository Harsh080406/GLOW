import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String },
    role: {
      type: String,
      required: true,
      enum: ["student", "driver", "super_admin", "transport_manager", "finance_admin"],
    },
    googleId: { type: String },
    refreshTokenHash: { type: String },
    avatar: { type: String },
    phone: { type: String },
    department: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
