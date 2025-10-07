import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";
import Car from "../models/Cars.js";

export default {
  data: new SlashCommandBuilder()
    .setName("profile")
    .setDescription("Show your registered cars"),

  async execute(interaction) {
    try {
      const cars = await Car.find({ user: interaction.user.id });
      if (!cars.length)
        return interaction.reply({
          content: "🚗 You have no registered cars.",
          ephemeral: true,
        });

      // Build buttons for cars
      const rows = [];
      for (let i = 0; i < cars.length; i += 5) {
        const slice = cars.slice(i, i + 5);
        const row = new ActionRowBuilder().addComponents(
          slice.map((car) =>
            new ButtonBuilder()
              .setCustomId(`car-${car.plate}`)
              .setLabel(`${car.make} ${car.model}`)
              .setStyle(ButtonStyle.Primary)
          )
        );
        rows.push(row);
      }

      await interaction.reply({
        content: "🚗 **Select a car to view its details:**",
        components: rows,
        ephemeral: true,
      });

      // Create collector for button clicks
      const filter = (i) =>
        i.customId.startsWith("car-") && i.user.id === interaction.user.id;

      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        time: 60000, // 1 minute
      });

      collector.on("collect", async (i) => {
        const plate = i.customId.replace("car-", "");
        const car = cars.find((c) => c.plate === plate);
        if (!car)
          return i.reply({ content: "❌ Car not found.", ephemeral: true });

        const embed = new EmbedBuilder()
          .setTitle("🚘 Car Details")
          .addFields(
            { name: "Make", value: car.make, inline: true },
            { name: "Model", value: car.model, inline: true },
            { name: "Color", value: car.color || "N/A", inline: true },
            { name: "Plate", value: car.plate, inline: true }
          )
          .setColor("Blue")
          .setFooter({ text: `Owned by ${interaction.user.username}` })
          .setTimestamp();

        await i.reply({ embeds: [embed], ephemeral: true });
      });

      collector.on("end", () => {
        interaction.editReply({
          content: "⌛ Car menu expired. Run `/profile` again to view your cars.",
          components: [],
        });
      });
    } catch (error) {
      console.error("❌ Error in /profile:", error);
      await interaction.reply({
        content: "❌ Error showing your cars.",
        ephemeral: true,
      });
    }
  },
};
