import { SlashCommandBuilder } from 'discord.js';
import fs from 'fs';

export default {
  data: new SlashCommandBuilder()
    .setName('register')
    .setDescription('Registra una macchina')
    .addStringOption(opt => opt.setName('make').setDescription('Marca').setRequired(true))
    .addStringOption(opt => opt.setName('model').setDescription('Modello').setRequired(true))
    .addStringOption(opt => opt.setName('color').setDescription('Colore').setRequired(true))
    .addStringOption(opt => opt.setName('plate').setDescription('Targa').setRequired(true)),

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

    await interaction.reply(`✅ Macchina registrata: **${car.make} ${car.model}** (${car.plate})`);
  }
};