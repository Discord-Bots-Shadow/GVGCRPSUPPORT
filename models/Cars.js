import mongoose from "mongoose";

const carSchema = new mongoose.Schema({
  user: { type: String, required: true },
  make: { type: String, required: true },
  model: { type: String, required: true },
  color: { type: String, required: true },
  plate: { type: String, required: true } // senza unique
});

export default mongoose.model("Car", carSchema);