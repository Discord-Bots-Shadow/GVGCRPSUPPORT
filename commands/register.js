import { SlashCommandBuilder } from "discord.js";
import Car from "../models/Cars.js";

export default {
  data: new SlashCommandBuilder()
    .setName("register")
    .setDescription("Register a new car")
    .addStringOption(opt => opt.setName("make").setDescription("Car make").setRequired(true))
    .addStringOption(opt => opt.setName("model").setDescription("Car model").setRequired(true))
    .addStringOption(opt => opt.setName("color").setDescription("Car color").setRequired(true))
    .addStringOption(opt => opt.setName("plate").setDescription("Car plate number").setRequired(true)),

  async execute(interaction) {
    const make = interaction.options.getString("make");
    const model = interaction.options.getString("model");
    const color = interaction.options.getString("color");
    const plate = interaction.options.getString("plate");

    try {
      // Creazione nuova auto senza controlli duplicati
      const car = new Car({
        user: interaction.user.id,
        make,
        model,
        color,
        plate
      });

      await car.save();
      await interaction.reply(`✅ Car registered: ${make} ${model}, Plate: ${plate}`);
      console.log(`➡️ /register: ${interaction.user.tag} registered ${make} ${model} (${plate})`);
    } catch (error) {
      console.error("❌ Error in /register:", error);
      await interaction.reply({
        content: "❌ Error registering the car.",
        ephemeral: true
      });
    }
  }
};