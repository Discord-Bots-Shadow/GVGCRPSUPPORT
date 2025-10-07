import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import GuildConfig from "../models/GuildConfig.js";

export default {
  data: new SlashCommandBuilder()
    .setName("over")
    .setDescription("Announce that the session is over.")
    .addStringOption(option =>
      option.setName("note").setDescription("Add an optional note.").setRequired(false)
    ),

  async execute(interaction) {
    const note = interaction.options.getString("note") || "No additional notes provided.";

    const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
    const hostRoleId = config?.hostRoleId;

    if (!hostRoleId)
      return interaction.reply({ content: "⚙️ Please run `/setup` first to configure host role.", ephemeral: true });

    if (!interaction.member.roles.cache.has(hostRoleId))
      return interaction.reply({ content: "🚫 You must have the **Host** role to use this command.", ephemeral: true });

    const embed = new EmbedBuilder()
      .setTitle("🔴 Session Over")
      .addFields({ name: "📝 Note from Host", value: note })
      .setColor("Red")
      .setTimestamp();

    await interaction.reply({ content: "@everyone", embeds: [embed] });
  },
};
