import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("startup")
    .setDescription("Announce that a session has started.")
    .addUserOption(option =>
      option
        .setName("host")
        .setDescription("Tag the host of the session.")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("link")
        .setDescription("Session link (e.g., game server or join link).")
        .setRequired(true)
    ),

  async execute(interaction) {
    const host = interaction.options.getUser("host");
    const link = interaction.options.getString("link");
    const sessionHostRoleId = "1416802953146400840"; // Session Host role ID

    // Check for permission
    if (!interaction.member.roles.cache.has(sessionHostRoleId)) {
      return await interaction.reply({
        content: "🚫 You must have the **Session Host** role to use this command.",
        ephemeral: true,
      });
    }

    // Build embed
    const embed = new EmbedBuilder()
      .setTitle("🟢 Session Started")
      .addFields(
        { name: "👤 Host", value: `${host}`, inline: true },
        { name: "🔗 Link", value: `${link}`, inline: true }
      )
      .setColor("Green")
      .setTimestamp();

    // Send message
    await interaction.reply({ content: "@everyone", embeds: [embed] });
  },
};
