const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const SESSION_HOST_ROLE_ID = '1416802953146400840';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('release')
    .setDescription('Announce that the session is starting.')
    .addUserOption(option =>
      option.setName('host')
        .setDescription('Select the host of the session')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('link')
        .setDescription('Link to the session or server')
        .setRequired(true)),

  async execute(interaction) {
    if (!interaction.member.roles.cache.has(SESSION_HOST_ROLE_ID)) {
      return interaction.reply({
        content: '❌ You do not have permission to use this command (Session Host only).',
        ephemeral: true,
      });
    }

    const host = interaction.options.getUser('host');
    const link = interaction.options.getString('link');

    const embed = new EmbedBuilder()
      .setColor(0x57F287)
      .setTitle('✅ Session Starting!')
      .addFields(
        { name: 'Host', value: `${host}`, inline: true },
        { name: 'Link', value: `[Join Here](${link})`, inline: true },
      )
      .setTimestamp();

    await interaction.reply({ content: '@everyone', embeds: [embed] });
  },
};
