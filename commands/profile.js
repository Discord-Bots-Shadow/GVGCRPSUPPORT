import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import fs from 'fs';

export default {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('Arata masinile tale inregistrate'),

  async execute(interaction) {
    const db = JSON.parse(fs.readFileSync('database.json'));
    const cars = db.filter(car => car.user === interaction.user.id);

    if (cars.length === 0) {
      await interaction.reply("🚗 Non hai macchine registrate.");
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
      content: "🚗 Le tue macchine:",
      components: [row]
    });
  }
};
