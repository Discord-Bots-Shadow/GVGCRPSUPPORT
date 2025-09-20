import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import Car from "../models/Cars.js";

export default {
  data: new SlashCommandBuilder()
    .setName("profile")
    .setDescription("Show your registered cars"),

  async execute(interaction) {
    try {
      const cars = await Car.find({ user: interaction.user.id });
      if (!cars.length) return interaction.reply("🚗 You have no registered cars.");

      const rows = [];
      for (let i = 0; i < cars.length; i += 5) {
        const slice = cars.slice(i, i + 5);
        const row = new ActionRowBuilder().addComponents(
          slice.map(car => new ButtonBuilder()
            .setCustomId(`car-${car.plate}`)
            .setLabel(`${car.make} ${car.model}`)
            .setStyle(ButtonStyle.Primary))
        );
        rows.push(row);
      }

      await interaction.reply({ content: "🚗 Your registered cars:", components: rows });
    } catch (error) {
      console.error("❌ Error in /profile:", error);
      await interaction.reply({ content: "❌ Error showing your cars.", ephemeral: true });
    }
  }
};