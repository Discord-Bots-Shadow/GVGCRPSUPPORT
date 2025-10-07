import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('delete')
    .setDescription('Delete a number of recent messages from this channel.')
    .addIntegerOption(option =>
      option
        .setName('amount')
        .setDescription('Number of messages to delete (1–100)')
        .setRequired(true)
    ),
  
  async execute(interaction) {
    const sessionHostRoleId = '1416802953146400840';

    // Check if the user has the Session Host role
    if (!interaction.member.roles.cache.has(sessionHostRoleId)) {
      return await interaction.reply({
        content: '🚫 You do not have permission to use this command.',
        ephemeral: true
      });
    }

    const amount = interaction.options.getInteger('amount');

    if (amount < 1 || amount > 100)
      return await interaction.reply({
        content: '❌ You can only delete between 1 and 100 messages.',
        ephemeral: true
      });

    await interaction.deferReply({ ephemeral: true });

    const deleted = await interaction.channel.bulkDelete(amount, true);

    await interaction.editReply(`🧹 Deleted **${deleted.size}** messages.`);
  }
};
