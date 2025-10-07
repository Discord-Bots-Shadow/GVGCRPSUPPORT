import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import GuildConfig from "../models/GuildConfig.js";

export default {
  data: new SlashCommandBuilder()
    .setName("startup")
    .setDescription("Announce that a session is starting.")
    .addUserOption(option =>
      option.setName("host").setDescription("Tag the session host.").setRequired(true)
    )
    .addStringOption(option =>
      option.setName("type").setDescription("Type of session.").setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName("needed").setDescription("Number of ✅ reactions needed to start.").setRequired(true)
    ),

  async execute(interaction) {
    const host = interaction.options.getUser("host");
    const type = interaction.options.getString("type");
    const needed = interaction.options.getInteger("needed");

    const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
    const hostRoleId = config?.hostRoleId;

    if (!hostRoleId)
      return interaction.reply({ content: "⚙️ Please run `/setup` first to configure host role.", ephemeral: true });

    if (!interaction.member.roles.cache.has(hostRoleId))
      return interaction.reply({ content: "🚫 You must have the **Host** role to use this command.", ephemeral: true });

    const embed = new EmbedBuilder()
      .setTitle("🚦 Session Announcement")
      .setDescription("A session is being hosted!")
      .addFields(
        { name: "👤 Host", value: `${host}`, inline: true },
        { name: "🕒 Type", value: `${type}`, inline: true },
        { name: "✅ Needed Reactions", value: `${needed}`, inline: true }
      )
      .setColor("Green")
      .setTimestamp();

    const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
    await msg.react("✅");
  },
};
