import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import GuildConfig from "../models/GuildConfig.js";

export default {
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Set up GVGCRP Bot for this server")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addRoleOption(option =>
      option
        .setName("hostrole")
        .setDescription("Role ID or mention for session hosts")
        .setRequired(true)
    )
    .addRoleOption(option =>
      option
        .setName("adminrole")
        .setDescription("Role ID or mention for server admins")
        .setRequired(false)
    ),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const hostRole = interaction.options.getRole("hostrole");
    const adminRole = interaction.options.getRole("adminrole");

    let config = await GuildConfig.findOne({ guildId });
    if (!config) config = new GuildConfig({ guildId });

    config.hostRoleId = hostRole.id;
    if (adminRole) config.adminRoleId = adminRole.id;
    await config.save();

    // ✅ Use editReply instead of reply (since it was deferred)
    await interaction.editReply({
      content: `✅ Configuration saved!\n**Host Role:** ${hostRole}\n${adminRole ? `**Admin Role:** ${adminRole}` : ""}`,
    });
  },
};
