import { SlashCommandBuilder } from "discord.js";
import Car from "../models/Cars.js";

export default {
  data: new SlashCommandBuilder()
    .setName("unregister")
    .setDescription("Delete a car")
    .addStringOption(opt => opt.setName("make").setDescription("Car make").setRequired(true))
    .addStringOption(opt => opt.setName("model").setDescription("Car model").setRequired(true))
    .addStringOption(opt => opt.setName("plate").setDescription("Car plate").setRequired(true)),

  async execute(interaction) {
    const make = interaction.options.getString("make");
    const model = interaction.options.getString("model");
    const plate = interaction.options.getString("plate");

    try {
      await Car.deleteOne({ user: interaction.user.id, make, model, plate });
      await interaction.reply({ content: `✅ Car ${plate} deleted successfully.`, ephemeral: true });
    } catch (error) {
      console.error("Error in /unregister:", error);
      await interaction.reply({ content: "❌ Error deleting the car.", ephemeral: true });
    }
  }
};