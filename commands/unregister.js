import { SlashCommandBuilder } from 'discord.js';
import fs from 'fs';

export default {
  data: new SlashCommandBuilder()
    .setName('unregister')
    .setDescription('Remove a car')
    .addStringOption(opt => opt.setName('make').setDescription('Car make').setRequired(true))
    .addStringOption(opt => opt.setName('model').setDescription('Car model').setRequired(true))
    .addStringOption(opt => opt.setName('plate').setDescription('Car plate').setRequired(true)),

  async execute(interaction) {
    const make = interaction.options.getString('make');
    const model = interaction.options.getString('model');
    const plate = interaction.options.getString('plate');

    let db = JSON.parse(fs.readFileSync('database.json'));
    const newDb = db.filter(car =>
      !(car.user === interaction.user.id && car.make === make && car.model === model && car.plate === plate)
    );

    fs.writeFileSync('database.json', JSON.stringify(newDb, null, 2));

    await interaction.reply({
      content: `✅ Car with plate **${plate}** removed successfully.`,
      ephemeral: true
    });
  }
};