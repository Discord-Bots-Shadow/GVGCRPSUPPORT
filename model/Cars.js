import mongoose from "mongoose";

const carSchema = new mongoose.Schema({
  user: { type: String, required: true },     // ID dell’utente Discord
  make: { type: String, required: true },     // Marca auto
  model: { type: String, required: true },    // Modello auto
  color: { type: String, required: true },    // Colore auto
  plate: { type: String, required: true }     // Targa auto
});

export default mongoose.model("Car", carSchema);