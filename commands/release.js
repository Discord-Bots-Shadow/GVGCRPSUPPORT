import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('release')
    .setDescription('Announce that the session is starting.')
    .addUserOption(option =>
      option.setName('host')
        .setDescription('Tag the host.')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('link')
        .setDescription('Session link (e.g., server link).')
        .setRequired(true)),

  async execute(interaction) {
    const host = interaction.options.getUser('host');
    const link = interaction.options.getString('link');
    const sessionHostRoleId = '1416802953146400840';

    if (!interaction.member.roles.cache.has(sessionHostRoleId)) {
      return await interaction.reply({
        content: '🚫 You must have the **Session Host** role to use this command.',
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle('🚗 Session Starting')
      .addFields(
        { name: '👤 Host', value: `${host}`, inline: true },
        { name: '🔗 Link', value: `${link}`, inline: true }
      )
      .setColor('Yellow')
      .setTimestamp();

    await interaction.reply({ content: '@everyone', embeds: [embed] });
  }
};
