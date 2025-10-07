import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import GuildConfig from "../models/GuildConfig.js";

export default {
  data: new SlashCommandBuilder()
    .setName("startup")
    .setDescription("Announce that a session is starting.")
    .addUserOption(opt => opt.setName("host").setDescription("Tag the session host.").setRequired(true))
    .addStringOption(opt => opt.setName("type").setDescription("Type of session.").setRequired(true))
    .addIntegerOption(opt => opt.setName("needed").setDescription("Number of ✅ reactions needed.").setRequired(true)),

  async execute(interaction) {
    // Defer early if you’ll do async work
    await interaction.deferReply({ ephemeral: true });

    const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
    if (!config || !config.hostRoleId) {
      return interaction.editReply("⚠️ Bot is not set up in this server. Please use `/setup`.");
    }

    if (!interaction.member.roles.cache.has(config.hostRoleId)) {
      return interaction.editReply("🚫 You must have the Host role to use this command.");
    }

    const host = interaction.options.getUser("host");
    const type = interaction.options.getString("type");
    const needed = interaction.options.getInteger("needed");

    const embed = new EmbedBuilder()
      .setTitle("🚦 Session Announcement")
      .setDescription("A session is being hosted!")
      .addFields(
        { name: "👤 Host", value: `${host}`, inline: true },
        { name: "🕒 Type", value: `${type}`, inline: true },
        { name: "✅ Needed", value: `${needed}`, inline: true }
      )
      .setColor("Green")
      .setTimestamp();

    const msg = await interaction.channel.send({ embeds: [embed] });
    await msg.react("✅");

    return interaction.editReply("✅ Session announced!");
  },
};
