import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import fs from 'fs';

export default {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('Mostra le tue macchine registrate'),

  async execute(interaction) {
    const db = JSON.parse(fs.readFileSync('database.json'));
    const cars = db.filter(car => car.user === interaction.user.id);

    if (cars.length === 0) {
      await interaction.reply("🚗 Non hai nessuna macchina registrata.");
      return;
    }

    // Dividiamo i bottoni in gruppi da 5
    const rows = [];
    for (let i = 0; i < cars.length; i += 5) {
      const buttons = cars.slice(i, i + 5).map(car =>
        new ButtonBuilder()
          .setCustomId(`car-${car.plate}`)
          .setLabel(`${car.make} ${car.model}`)
          .setStyle(ButtonStyle.Primary)
      );
      rows.push(new ActionRowBuilder().addComponents(buttons));
    }

    await interaction.reply({
      content: "🚗 Le tue macchine:",
      components: rows
    });
  }
};