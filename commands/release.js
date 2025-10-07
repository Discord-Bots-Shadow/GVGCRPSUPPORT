import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import GuildConfig from "../models/GuildConfig.js";

export default {
  data: new SlashCommandBuilder()
    .setName("release")
    .setDescription("Announce that the session is starting.")
    .addUserOption(option =>
      option.setName("host").setDescription("Tag the host.").setRequired(true)
    )
    .addStringOption(option =>
      option.setName("link").setDescription("Session link.").setRequired(true)
    ),

  async execute(interaction) {
    const host = interaction.options.getUser("host");
    const link = interaction.options.getString("link");

    const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
    const hostRoleId = config?.hostRoleId;

    if (!hostRoleId)
      return interaction.reply({ content: "⚙️ Please run `/setup` first to configure host role.", ephemeral: true });

    if (!interaction.member.roles.cache.has(hostRoleId))
      return interaction.reply({ content: "🚫 You must have the **Host** role to use this command.", ephemeral: true });

    const embed = new EmbedBuilder()
      .setTitle("🚗 Session Starting")
      .addFields(
        { name: "👤 Host", value: `${host}`, inline: true },
        { name: "🔗 Link", value: `${link}`, inline: true }
      )
      .setColor("Yellow")
      .setTimestamp();

    await interaction.reply({ content: "@everyone", embeds: [embed] });
  },
};
