import { SlashCommandBuilder } from "discord.js";
import GuildConfig from "../models/GuildConfig.js";

export default {
  data: new SlashCommandBuilder()
    .setName("delete")
    .setDescription("Delete a number of recent messages from this channel.")
    .addIntegerOption(option =>
      option.setName("amount").setDescription("Number of messages to delete (1–100)").setRequired(true)
    ),

  async execute(interaction) {
    const amount = interaction.options.getInteger("amount");

    const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
    const hostRoleId = config?.hostRoleId;

    if (!hostRoleId)
      return interaction.reply({ content: "⚙️ Please run `/setup` first to configure host role.", ephemeral: true });

    if (!interaction.member.roles.cache.has(hostRoleId))
      return interaction.reply({ content: "🚫 You do not have permission to use this command.", ephemeral: true });

    if (amount < 1 || amount > 100)
      return interaction.reply({ content: "❌ You can only delete between 1 and 100 messages.", ephemeral: true });

    await interaction.deferReply({ ephemeral: true });
    const deleted = await interaction.channel.bulkDelete(amount, true);
    await interaction.editReply(`🧹 Deleted **${deleted.size}** messages.`);
  },
};
