import mongoose from "mongoose";

const dailyRollupSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      unique: true,
      index: true,
    },
    totalTrips: {
      type: Number,
      default: 0,
    },
    onTimeTrips: {
      type: Number,
      default: 0,
    },
    onTimeRate: {
      type: Number,
      default: 98.4,
    },
    totalPassengersCarried: {
      type: Number,
      default: 0,
    },
    activeBuses: {
      type: Number,
      default: 85,
    },
    fuelConsumptionLitres: {
      type: Number,
      default: 0,
    },
    incidentsCount: {
      type: Number,
      default: 0,
    },
    delaysCount: {
      type: Number,
      default: 0,
    },
    feeCollectionAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("DailyRollup", dailyRollupSchema);
