import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("startup")
    .setDescription("Announce that a session is starting.")
    .addUserOption(option =>
      option
        .setName("host")
        .setDescription("Tag the session host.")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("type")
        .setDescription("Type of session.")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName("needed")
        .setDescription("Number of ✅ reactions needed to start the session.")
        .setRequired(true)
    ),

  async execute(interaction) {
    const host = interaction.options.getUser("host");
    const type = interaction.options.getString("type");
    const needed = interaction.options.getInteger("needed");
    
    // Hardcoded role ID (optional — change or remove if not needed)
    const sessionHostRoleId = "1416802953146400840";

    // Check permission
    if (!interaction.member.roles.cache.has(sessionHostRoleId)) {
      return await interaction.reply({
        content: "🚫 You must have the **Session Host** role to use this command.",
        ephemeral: true,
      });
    }

    // Create embed
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

    // Send embed and react
    const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
    await msg.react("✅");
  },
};
