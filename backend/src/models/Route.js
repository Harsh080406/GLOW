import mongoose from "mongoose";

const stopSchema = new mongoose.Schema({
  id: { type: Number },
  name: { type: String, required: true },
  time: { type: String },
  returnTime: { type: String },
  dist: { type: String },
  isPickup: { type: Boolean, default: false },
});

const routeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    startPoint: { type: String, required: true },
    endPoint: { type: String, required: true },
    distance: { type: String },
    duration: { type: String },
    assignedBus: { type: String },
    assignedDriver: { type: String },
    totalStudents: { type: Number, default: 0 },
    status: { type: String, default: "Active" },
    stops: [stopSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Route", routeSchema);
