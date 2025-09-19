import { SlashCommandBuilder } from 'discord.js';
import fs from 'fs';

export default {
  data: new SlashCommandBuilder()
    .setName('unregister')
    .setDescription('Sterge o masina')
    .addStringOption(opt => opt.setName('marca').setDescription('Marca masinii').setRequired(true))
    .addStringOption(opt => opt.setName('model').setDescription('Modelul masinii').setRequired(true))
    .addStringOption(opt => opt.setName('nr_de_inmatriculare').setDescription('Numarul de inmatriculare').setRequired(true)),

  async execute(interaction) {
    const marca = interaction.options.getString('marca');
    const model = interaction.options.getString('model');
    const nrInm = interaction.options.getString('nr_de_inmatriculare');

    let db = JSON.parse(fs.readFileSync('database.json'));
    const newDb = db.filter(car =>
      !(car.user === interaction.user.id && car.make === marca && car.model === model && car.plate === nrInm)
    );

    fs.writeFileSync('database.json', JSON.stringify(newDb, null, 2));

    await interaction.reply({
      content: `✅ Masina cu numarul de inmatriculare **${nrInm}** a fost stearsa cu succes.`,
      ephemeral: true
    });
  }
};
