import express from "express";
import { Client, GatewayIntentBits, Collection, Events } from "discord.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

// === Express keep-alive ===
const app = express();
app.get("/", (req, res) => res.send("✅ GVGCRP Bot is running!"));
app.listen(process.env.PORT || 3000, () => console.log("🌐 Web server active."));

// === Discord client ===
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
client.commands = new Collection();

// === MongoDB connection ===
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("🟢 Connected to MongoDB");
  } catch (err) {
    console.error("🔴 MongoDB connection error:", err.message);
  }
})();

// === Load commands ===
const commandFiles = fs.readdirSync("./commands").filter((f) => f.endsWith(".js"));
for (const file of commandFiles) {
  const command = await import(`./commands/${file}`);
  client.commands.set(command.default.data.name, command.default);
}

// === Bot ready ===
client.once(Events.ClientReady, () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

// === Command handler ===
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    // Immediately defer reply so Discord doesn’t timeout
    await interaction.deferReply({ ephemeral: true });

    // Run command logic
    await command.execute(interaction);

  } catch (error) {
    console.error(error);
    try {
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ content: "❌ Error executing command." });
      } else {
        await interaction.reply({ content: "❌ Error executing command.", ephemeral: true });
      }
    } catch (err) {
      console.error("Failed to send error reply:", err);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
