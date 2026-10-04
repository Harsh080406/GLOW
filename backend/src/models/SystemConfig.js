import mongoose from "mongoose";

const systemConfigSchema = new mongoose.Schema(
  {
    singletonId: {
      type: String,
      required: true,
      unique: true,
      default: "SYSTEM_CONFIG_SINGLETON",
    },
    gpsPollingFrequency: {
      type: Number,
      default: 3,
      min: 1,
      max: 10,
    },
    sosAutoDispatch: {
      type: Boolean,
      default: true,
    },
    paymentGracePeriodDays: {
      type: Number,
      default: 15,
      min: 0,
      max: 60,
    },
    autoBalanceCorridors: {
      type: Boolean,
      default: true,
    },
    systemMaintenanceMode: {
      type: Boolean,
      default: false,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Mongoose Singleton Pattern
systemConfigSchema.statics.getSingleton = async function () {
  let config = await this.findOne({ singletonId: "SYSTEM_CONFIG_SINGLETON" });
  if (!config) {
    config = await this.create({ singletonId: "SYSTEM_CONFIG_SINGLETON" });
  }
  return config;
};

export default mongoose.model("SystemConfig", systemConfigSchema);
