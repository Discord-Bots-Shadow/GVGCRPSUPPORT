import { SlashCommandBuilder } from 'discord.js';
import fs from 'fs';

export default {
  data: new SlashCommandBuilder()
    .setName('register')
    .setDescription('Inregistreaza o masina')
    .addStringOption(opt => opt.setName('marca').setDescription('Marca masinii').setRequired(true))
    .addStringOption(opt => opt.setName('model').setDescription('Modelul masinii').setRequired(true))
    .addStringOption(opt => opt.setName('culoare').setDescription('Culoarea masinii').setRequired(true))
    .addStringOption(opt => opt.setName('nr_de_inmatriculare').setDescription('Numarul de inmatriculare').setRequired(true)),

  async execute(interaction) {
    const car = {
      user: interaction.user.id,
      make: interaction.options.getString('marca'),
      model: interaction.options.getString('model'),
      color: interaction.options.getString('culoare'),
      plate: interaction.options.getString('nr_de_inmatriculare')
    };

    // Legge e scrive il database
    const db = JSON.parse(fs.readFileSync('database.json'));
    db.push(car);
    fs.writeFileSync('database.json', JSON.stringify(db, null, 2));

    await interaction.reply(`✅ Macchina registrata: ${car.make}, ${car.model}, ${car.plate}`);
  }
};
