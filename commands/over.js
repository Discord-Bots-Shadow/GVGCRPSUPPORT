import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("over")
    .setDescription("Announce that the session is over.")
    .addStringOption(option =>
      option.setName("note")
        .setDescription("Add an optional note.")
        .setRequired(false)),

  async execute(interaction) {
    const note = interaction.options.getString("note") || "No additional notes provided.";
    const sessionHostRoleId = "1416802953146400840";

    if (!interaction.member.roles.cache.has(sessionHostRoleId)) {
      return await interaction.reply({
        content: "🚫 You must have the **Session Host** role to use this command.",
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("🔴 Session Over")
      .addFields({ name: "📝 Note from Host", value: note })
      .setColor("Red")
      .setTimestamp();

    await interaction.reply({ content: "@everyone", embeds: [embed] });
  },
};
