import { SlashCommandBuilder } from 'discord.js';
import fs from 'fs';

export default {
  data: new SlashCommandBuilder()
    .setName('register')
    .setDescription('Register a car')
    .addStringOption(opt => opt.setName('make').setDescription('Car make').setRequired(true))
    .addStringOption(opt => opt.setName('model').setDescription('Car model').setRequired(true))
    .addStringOption(opt => opt.setName('color').setDescription('Car color').setRequired(true))
    .addStringOption(opt => opt.setName('plate').setDescription('Car plate').setRequired(true)),

  async execute(interaction) {
    const car = {
      user: interaction.user.id,
      make: interaction.options.getString('make'),
      model: interaction.options.getString('model'),
      color: interaction.options.getString('color'),
      plate: interaction.options.getString('plate')
    };

    const db = JSON.parse(fs.readFileSync('database.json'));
    db.push(car);
    fs.writeFileSync('database.json', JSON.stringify(db, null, 2));

    await interaction.reply(`✅ Car registered: ${car.make}, ${car.model}, ${car.plate}`);
  }
};