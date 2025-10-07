import express from "express";
import dotenv from "dotenv";
import { Client, GatewayIntentBits, Events, Collection } from "discord.js";
import mongoose from "mongoose";
import fs from "fs";
import fetch from "node-fetch"; // add this if you're using fetch in Node.js < 18

// Load environment variables
dotenv.config();

// === KeepAlive Server ===
const app = express();
app.get("/", (req, res) => res.send("✅ Bot is alive!"));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ KeepAlive on port ${PORT}`));

// Optional: self-ping for Render free tier
if (process.env.KEEP_ALIVE_URL) {
  setInterval(() => {
    fetch(process.env.KEEP_ALIVE_URL)
      .then(res => console.log(`🔁 KeepAlive ping -> ${res.status}`))
      .catch(err => console.error("KeepAlive error:", err));
  }, 10 * 60 * 1000); // every 10 minutes
}

// === MongoDB Connection ===
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// === Discord Client Setup ===
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

// Load command files dynamically
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const commandModule = await import(`./commands/${file}`);
  const command = commandModule.default;
  client.commands.set(command.data.name, command);
}

// === Bot Ready Event ===
client.once(Events.ClientReady, () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

// === Interaction Handling ===
client.on(Events.InteractionCreate, async interaction => {
  // Slash command handler
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error("Command error:", error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: "⚠️ Error executing command!", ephemeral: true });
      } else {
        await interaction.reply({ content: "⚠️ Error executing command!", ephemeral: true });
      }
    }
  }

  // Optional: Example of button interaction (if you use car buttons)
  else if (interaction.isButton()) {
    const plate = interaction.customId.split("-")[1];
    const Car = (await import("./models/Cars.js")).default;
    const car = await Car.findOne({ plate, user: interaction.user.id });

    if (!car) {
      return interaction.reply({ content: "🚫 Car not found or not yours.", ephemeral: true });
    }

    await interaction.reply({
      content: `🚗 Car Details:
- Make: ${car.make}
- Model: ${car.model}
- Color: ${car.color}
- Plate: ${car.plate}`,
      ephemeral: true
    });
  }
});

// === Login to Discord ===
client.login(process.env.DISCORD_TOKEN);
