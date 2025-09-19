import { SlashCommandBuilder } from 'discord.js';
import Car from '../models/Cars.js';

export default {
  data: new SlashCommandBuilder()
    .setName('register')
    .setDescription('Register a new car')
    .addStringOption(opt => opt.setName('make').setDescription('Car make').setRequired(true))
    .addStringOption(opt => opt.setName('model').setDescription('Car model').setRequired(true))
    .addStringOption(opt => opt.setName('color').setDescription('Car color').setRequired(true))
    .addStringOption(opt => opt.setName('plate').setDescription('Car plate').setRequired(true)),

  async execute(interaction) {
    try {
      const newCar = new Car({
        user: interaction.user.id,
        make: interaction.options.getString('make'),
        model: interaction.options.getString('model'),
        color: interaction.options.getString('color'),
        plate: interaction.options.getString('plate')
      });

      await newCar.save();

      await interaction.reply(`✅ Car registered: ${newCar.make} ${newCar.model} (${newCar.plate})`);
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: '❌ Error registering the car.', ephemeral: true });
    }
  }
};