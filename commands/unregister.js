import { SlashCommandBuilder } from 'discord.js';
import fs from 'fs';

export default {
  data: new SlashCommandBuilder()
    .setName('unregister')
    .setDescription('Rimuovi una macchina registrata')
    .addStringOption(opt => opt.setName('plate').setDescription('Targa').setRequired(true)),

  async execute(interaction) {
    const plate = interaction.options.getString('plate');

    let db = JSON.parse(fs.readFileSync('database.json'));
    const newDb = db.filter(car => !(car.user === interaction.user.id && car.plate === plate));

    fs.writeFileSync('database.json', JSON.stringify(newDb, null, 2));

    await interaction.reply({
      content: `✅ La macchina con targa **${plate}** è stata rimossa.`,
      ephemeral: true
    });
  }
};