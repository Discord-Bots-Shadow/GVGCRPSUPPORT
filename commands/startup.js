import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('startup')
    .setDescription('Announce that a session is starting.')
    .addUserOption(option =>
      option.setName('host')
        .setDescription('Tag the session host.')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Type of session.')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('needed')
        .setDescription('Number of ✅ reactions needed to start the session.')
        .setRequired(true)),

  async execute(interaction) {
    const host = interaction.options.getUser('host');
    const type = interaction.options.getString('type');
    const needed = interaction.options.getInteger('needed');
    const sessionHostRoleId = '1416802953146400840';

    if (!interaction.member.roles.cache.has(sessionHostRoleId)) {
      return await interaction.reply({
        content: '🚫 You must have the **Session Host** role to use this command.',
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle('🚦 Session Announcement')
      .setDescription(`A session is being hosted!`)
      .addFields(
        { name: '👤 Host', value: `${host}`, inline: true },
        { name: '🕒 Type', value: `${type}`, inline: true },
        { name: '✅ Needed Reactions', value: `${needed}`, inline: true }
      )
      .setColor('Green')
      .setTimestamp();

    const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
    await msg.react('✅');
  }
};
