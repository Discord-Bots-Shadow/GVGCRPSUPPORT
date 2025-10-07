import express from "express";
import { Client, GatewayIntentBits, Collection, Events } from "discord.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

// Express part (for Render to keep service alive)
const app = express();
app.get("/", (req, res) => res.send("✅ GVGCRP Bot is running!"));
app.listen(process.env.PORT || 3000, () => console.log("🌐 Web server active."));

// Discord bot setup
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});
client.commands = new Collection();

// Load commands
const commandFiles = fs.readdirSync("./commands").filter(f => f.endsWith(".js"));
for (const file of commandFiles) {
  const command = await import(`./commands/${file}`);
  client.commands.set(command.default.data.name, command.default);
}

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Bot ready
client.once(Events.ClientReady, () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

// Interaction handler
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    // Let the command itself decide whether to defer or reply
    await command.execute(interaction);
  } catch (error) {
    console.error("Command Error:", error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: "❌ Error executing command.", ephemeral: true });
    } else {
      // Already replied or deferred; fall back to followUp
      await interaction.followUp({ content: "❌ Error executing command.", ephemeral: true });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
