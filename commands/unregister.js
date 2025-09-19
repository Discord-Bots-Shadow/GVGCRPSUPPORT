import { SlashCommandBuilder } from 'discord.js';
import fs from 'fs';

export default {
  data: new SlashCommandBuilder()
    .setName('unregister')
    .setDescription('Unregister a car')
    .addStringOption(opt => opt.setName('plate').setDescription('Car plate').setRequired(true)),

  async execute(interaction) {
    const plate = interaction.options.getString('plate');

    const db = JSON.parse(fs.readFileSync('database.json'));
    const newDb = db.filter(car =>
      !(car.user === interaction.user.id && car.plate === plate)
    );

    fs.writeFileSync('database.json', JSON.stringify(newDb, null, 2));

    await interaction.reply({
      content: `✅ Car with plate **${plate}** removed successfully.`,
      ephemeral: true
    });
  }
};