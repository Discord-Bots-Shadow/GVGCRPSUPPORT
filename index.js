import express from "express";
import { Client, GatewayIntentBits, Collection } from "discord.js";
import dotenv from "dotenv";
import fs from "fs";
import mongoose from "mongoose";

dotenv.config();

// === Express web server (keeps Render/host alive) ===
const app = express();
app.get("/", (req, res) => res.send("✅ GVGCRP Bot is running!"));
app.listen(process.env.PORT || 3000, () => console.log("🌐 Web server active."));

// === MongoDB Connection ===
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// === Discord Bot Setup ===
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.commands = new Collection();

// Load all command files from /commands
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = await import(`./commands/${file}`);
  client.commands.set(command.default.data.name, command.default);
}

// === Bot Ready ===
client.on("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

// === Interaction Handling ===
client.on("interactionCreate", async interaction => {
  // Slash commands
  if (interaction.isCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`❌ Error executing /${interaction.commandName}:`, error);
      if (!interaction.replied)
        await interaction.reply({ content: "❌ There was an error executing this command.", ephemeral: true });
    }
    return;
  }

  // === Handle Button Interactions ===
  if (interaction.isButton()) {
    try {
      // Handle car buttons
      if (interaction.customId.startsWith("car-")) {
        const plate = interaction.customId.replace("car-", "");

        // Lazy import Cars model
        const Car = (await import("./models/Cars.js")).default;
        const car = await Car.findOne({ plate });

        if (!car) {
          return await interaction.reply({ content: "🚫 Car not found.", ephemeral: true });
        }

        await interaction.reply({
          content: `🚗 **${car.make} ${car.model}**\nPlate: **${car.plate}**\nOwner: <@${car.user}>`,
          ephemeral: true
        });
      }

    } catch (err) {
      console.error("❌ Error handling button interaction:", err);
      if (!interaction.replied)
        await interaction.reply({ content: "⚠️ Error processing button action.", ephemeral: true });
    }
  }
});

// === Login Bot ===
client.login(process.env.DISCORD_TOKEN);
