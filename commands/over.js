const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const SESSION_HOST_ROLE_ID = '1416802953146400840';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('over')
    .setDescription('Announce that the session is over.')
    .addUserOption(option =>
      option.setName('host')
        .setDescription('Select the host of the session')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('note')
        .setDescription('Optional note from the host (e.g. thank you message)')
        .setRequired(false)),

  async execute(interaction) {
    if (!interaction.member.roles.cache.has(SESSION_HOST_ROLE_ID)) {
      return interaction.reply({
        content: '❌ You do not have permission to use this command (Session Host only).',
        ephemeral: true,
      });
    }

    const host = interaction.options.getUser('host');
    const note = interaction.options.getString('note') || 'No additional notes.';

    const embed = new EmbedBuilder()
      .setColor(0xED4245)
      .setTitle('🏁 Session Over')
      .addFields(
        { name: 'Host', value: `${host}`, inline: true },
        { name: 'Note', value: note }
      )
      .setTimestamp();

    await interaction.reply({ content: '@everyone', embeds: [embed] });
  },
};
