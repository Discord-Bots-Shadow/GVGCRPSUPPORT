import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import fs from 'fs';

export default {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('Show your registered cars'),

  async execute(interaction) {
    const db = JSON.parse(fs.readFileSync('database.json'));
    const cars = db.filter(car => car.user === interaction.user.id);

    if (cars.length === 0) {
      await interaction.reply("🚗 You don't have any registered cars.");
      return;
    }

    const rows = [];
    for (let i = 0; i < cars.length; i += 5) {
      const slice = cars.slice(i, i + 5);
      const buttons = slice.map(car =>
        new ButtonBuilder()
          .setCustomId(`car-${car.plate}`)
          .setLabel(`${car.make} ${car.model}`)
          .setStyle(ButtonStyle.Primary)
      );
      rows.push(new ActionRowBuilder().addComponents(buttons));
    }

    await interaction.reply({
      content: "🚗 Your cars:",
      components: rows
    });
  }
};