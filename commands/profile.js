import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import Car from '../models/Car.js';

export default {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('Show your registered cars'),

  async execute(interaction) {
    try {
      const cars = await Car.find({ user: interaction.user.id });

      if (!cars.length) {
        await interaction.reply('🚗 You have no registered cars.');
        return;
      }

      const buttons = cars.slice(0, 5).map(car =>
        new ButtonBuilder()
          .setCustomId(`car-${car.plate}`)
          .setLabel(`${car.make} ${car.model}`)
          .setStyle(ButtonStyle.Primary)
      );

      const row = new ActionRowBuilder().addComponents(buttons);

      await interaction.reply({
        content: '🚗 Your cars:',
        components: [row]
      });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: '❌ Error fetching your cars.', ephemeral: true });
    }
  }
};