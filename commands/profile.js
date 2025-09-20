import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import Car from "../models/Cars.js";

export default {
  data: new SlashCommandBuilder()
    .setName("profile")
    .setDescription("Show your registered cars"),

  async execute(interaction) {
    console.log("➡️ /profile called by", interaction.user.tag);

    try {
      const cars = await Car.find({ user: interaction.user.id });
      console.log(`🔎 Found ${cars.length} cars for user ${interaction.user.tag}`);

      if (cars.length === 0) {
        await interaction.reply("🚗 You have no registered cars.");
        return;
      }

      const buttons = cars.slice(0, 5).map(car =>
        new ButtonBuilder()
          .setCustomId(`car-${car.plate}`)
          .setLabel(`${car.make} ${car.model}`)
          .setStyle(ButtonStyle.Primary)
      );

      const row = new ActionRowBuilder().addComponents(buttons);

      await interaction.reply({
        content: "🚗 Your registered cars:",
        components: [row]
      });
    } catch (error) {
      console.error("❌ Error in /profile:", error);
      await interaction.reply({
        content: "❌ Error showing your cars.",
        ephemeral: true
      });
    }
  }
};