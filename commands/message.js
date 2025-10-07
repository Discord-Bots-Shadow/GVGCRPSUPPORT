// commands/message.js
import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("message")
    .setDescription("Send a custom message with auto reactions")
    .addStringOption(opt =>
      opt.setName("text")
        .setDescription("The message content to send")
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName("reactions")
        .setDescription("Emoji(s) to auto react with (space-separated)")
        .setRequired(false)
    ),

  async execute(interaction) {
    const messageText = interaction.options.getString("text");
    const reactions = interaction.options.getString("reactions")?.split(" ") || [];

    const embed = new EmbedBuilder()
      .setTitle("📨 Message Preview")
      .setDescription(messageText)
      .setColor(0x2f3136)
      .setFooter({ text: reactions.length > 0 ? `Auto reactions: ${reactions.join(" ")}` : "No auto reactions" });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("sendMessage")
        .setLabel("Send Message")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("cancelMessage")
        .setLabel("Cancel")
        .setStyle(ButtonStyle.Danger)
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true,
    });

    // Wait for the button press
    const collector = interaction.channel.createMessageComponentCollector({
      filter: i => i.user.id === interaction.user.id,
      time: 60000,
    });

    collector.on("collect", async i => {
      if (i.customId === "sendMessage") {
        const sent = await i.channel.send({ content: messageText });
        for (const emoji of reactions) {
          try {
            await sent.react(emoji);
          } catch (err) {
            console.error(`Failed to react with ${emoji}:`, err.message);
          }
        }
        await i.update({ content: "✅ Message sent!", embeds: [], components: [], ephemeral: true });
        collector.stop();
      } else if (i.customId === "cancelMessage") {
        await i.update({ content: "❌ Message canceled.", embeds: [], components: [], ephemeral: true });
        collector.stop();
      }
    });

    collector.on("end", async (_, reason) => {
      if (reason === "time") {
        await interaction.editReply({
          content: "⌛ Message setup timed out.",
          embeds: [],
          components: [],
        });
      }
    });
  },
};
