import { SlashCommandBuilder } from 'discord.js';
import Car from '../models/Car.js';

export default {
  data: new SlashCommandBuilder()
    .setName('unregister')
    .setDescription('Remove a car')
    .addStringOption(opt => opt.setName('make').setDescription('Car make').setRequired(true))
    .addStringOption(opt => opt.setName('model').setDescription('Car model').setRequired(true))
    .addStringOption(opt => opt.setName('plate').setDescription('Car plate').setRequired(true)),

  async execute(interaction) {
    try {
      const make = interaction.options.getString('make');
      const model = interaction.options.getString('model');
      const plate = interaction.options.getString('plate');

      const result = await Car.deleteOne({
        user: interaction.user.id,
        make,
        model,
        plate
      });

      if (result.deletedCount === 0) {
        await interaction.reply({ content: '❌ Car not found.', ephemeral: true });
      } else {
        await interaction.reply({ content: `✅ Car ${plate} removed successfully.`, ephemeral: true });
      }
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: '❌ Error removing the car.', ephemeral: true });
    }
  }
};