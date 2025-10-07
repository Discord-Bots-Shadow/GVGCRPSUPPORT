import express from "express";
import dotenv from "dotenv";
import fs from "fs";
import mongoose from "mongoose";
import {
  Client,
  GatewayIntentBits,
  Collection,
  Events,
} from "discord.js";

dotenv.config();

// --- Keep alive for Render ---
const app = express();
app.get("/", (req, res) => res.send("✅ Bot is alive!"));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌐 KeepAlive server running on port ${PORT}`));

if (process.env.KEEP_ALIVE_URL) {
  setInterval(() => {
    fetch(process.env.KEEP_ALIVE_URL)
      .then(() => console.log("🔁 Pinged self to stay awake"))
      .catch(() => {});
  }, 10 * 60 * 1000);
}

// --- MongoDB Connection ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// --- Discord Bot Setup ---
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.commands = new Collection();

// --- Load Commands ---
const commandFiles = fs.readdirSync("./commands").filter((f) => f.endsWith(".js"));
for (const file of commandFiles) {
  const command = await import(`./commands/${file}`);
  client.commands.set(command.default.data.name, command.default);
  console.log(`🧩 Loaded command: ${command.default.data.name}`);
}

// --- When Bot is Ready ---
client.once(Events.ClientReady, (c) => {
  console.log(`🤖 Logged in as ${c.user.tag}`);
});

// --- Interaction Handling ---
client.on(Events.InteractionCreate, async (interaction) => {
  // Slash Command Handler
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(err);
      const reply = { content: "❌ Error executing command!", ephemeral: true };
      if (interaction.replied || interaction.deferred)
        await interaction.followUp(reply);
      else
        await interaction.reply(reply);
    }
  }

  // Button Handling
  if (interaction.isButton()) {
    // --- /message command buttons ---
    if (interaction.customId === "message-send") {
      const embed = interaction.message.embeds[0];
      if (!embed) return interaction.reply({ content: "❌ No embed found.", ephemeral: true });

      const emoji = embed.footer?.text?.replace("Auto reaction: ", "") || "👍";

      try {
        const sent = await interaction.channel.send({ embeds: [embed] });
        await sent.react(emoji).catch(() => {});
        await interaction.reply({ content: "✅ Message sent successfully!", ephemeral: true });
      } catch (err) {
        console.error(err);
        await interaction.reply({ content: "❌ Failed to send message.", ephemeral: true });
      }
    }

    if (interaction.customId === "message-cancel") {
      await interaction.reply({ content: "❌ Message cancelled.", ephemeral: true });
    }

    // You can add other button logic here (like car system, etc.)
  }
});

// --- Login to Discord ---
client.login(process.env.DISCORD_TOKEN);
