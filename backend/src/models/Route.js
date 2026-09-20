import mongoose from "mongoose";

const stopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lat: { type: Number },
  lng: { type: Number },
  orderIndex: { type: Number, required: true },
  etaOffsetMin: { type: Number, default: 0 },
});

const routeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    distanceKm: { type: Number, required: true },
    durationMin: { type: Number, required: true },
    stops: [stopSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Route", routeSchema);
