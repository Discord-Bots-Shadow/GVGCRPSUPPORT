const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const SESSION_HOST_ROLE_ID = '1416802953146400840'; // your Session Host role ID

module.exports = {
  data: new SlashCommandBuilder()
    .setName('startup')
    .setDescription('Announce a Greenville session startup.')
    .addUserOption(option =>
      option.setName('host')
        .setDescription('Select the host of the session')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Type of session (e.g. RP, public, convoy)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('time')
        .setDescription('Time of the session')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('needed_reactions')
        .setDescription('Number of ✅ reactions needed to start')
        .setRequired(true)),

  async execute(interaction) {
    // Check role
    if (!interaction.member.roles.cache.has(SESSION_HOST_ROLE_ID)) {
      return interaction.reply({
        content: '❌ You do not have permission to use this command (Session Host only).',
        ephemeral: true,
      });
    }

    const host = interaction.options.getUser('host');
    const type = interaction.options.getString('type');
    const time = interaction.options.getString('time');
    const neededReactions = interaction.options.getInteger('needed_reactions');

    const embed = new EmbedBuilder()
      .setColor(0x00AE86)
      .setTitle('🚗 Session Startup')
      .setDescription('We are hosting a session!')
      .addFields(
        { name: 'Host', value: `${host}`, inline: true },
        { name: 'Type of Session', value: type, inline: true },
        { name: 'Time', value: time, inline: true },
        { name: 'Goal', value: `We need **${neededReactions}** ✅ reactions to start the session.` }
      )
      .setTimestamp();

    // Send message and react to it
    const message = await interaction.reply({ content: '@everyone', embeds: [embed], fetchReply: true });
    await message.react('✅');
  },
};
