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
    .setDescription("Send a custom embedded message with optional auto reaction.")
    .addStringOption(option =>
      option
        .setName("title")
        .setDescription("The title of the embed.")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("content")
        .setDescription("The main content of the embed.")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("color")
        .setDescription("The color of the embed (hex or name, e.g. #00ff00 or Blue).")
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName("emoji")
        .setDescription("Emoji to auto-react with (e.g. 👍 or 🔥).")
        .setRequired(false)
    ),

  async execute(interaction) {
    const title = interaction.options.getString("title");
    const content = interaction.options.getString("content");
    const color = interaction.options.getString("color") || "#00ADEF";
    const emoji = interaction.options.getString("emoji");

    // Build the preview embed
    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(content)
      .setColor(color)
      .setFooter({ text: `Sent by ${interaction.user.tag}` })
      .setTimestamp();

    // Buttons
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("send_message")
        .setLabel("Send Message")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("auto_react")
        .setLabel("Auto React")
        .setStyle(ButtonStyle.Primary)
    );

    // Show ephemeral preview
    await interaction.reply({
      content: "Here’s your message preview 👇 (only visible to you)",
      embeds: [embed],
      components: [row],
      ephemeral: true,
    });

    // Handle button interactions
    const filter = i =>
      ["send_message", "auto_react"].includes(i.customId) &&
      i.user.id === interaction.user.id;

    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 60000,
    });

    let sentMessage = null;

    collector.on("collect", async i => {
      if (i.customId === "send_message") {
        sentMessage = await i.channel.send({ embeds: [embed] });
        await i.reply({ content: "✅ Message sent!", ephemeral: true });
      } else if (i.customId === "auto_react") {
        if (!emoji)
          return i.reply({
            content: "❌ No emoji provided in the command.",
            ephemeral: true,
          });
        if (!sentMessage)
          return i.reply({
            content: "⚠️ Send the message first using the 'Send Message' button.",
            ephemeral: true,
          });
        try {
          await sentMessage.react(emoji);
          await i.reply({
            content: `✅ Reacted with ${emoji}`,
            ephemeral: true,
          });
        } catch (err) {
          console.error(err);
          await i.reply({
            content: "❌ Failed to react. Make sure I can use that emoji.",
            ephemeral: true,
          });
        }
      }
    });
  },
};
