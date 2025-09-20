import express from "express";
import dotenv from "dotenv";
import { Client, GatewayIntentBits, Events, Collection } from "discord.js";
import mongoose from "mongoose";
import fs from "fs";

dotenv.config();

const app = express();
app.get("/", (req, res) => res.send("Bot is alive!"));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ KeepAlive on port ${PORT}`));

if (process.env.KEEP_ALIVE_URL) {
  setInterval(() => {
    fetch(process.env.KEEP_ALIVE_URL)
      .then(res => console.log(`Ping -> ${res.status}`))
      .catch(err => console.error(err));
  }, 10 * 60 * 1000);
}

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

// Discord client
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();
const commandFiles = fs.readdirSync("./commands").filter(f => f.endsWith(".js"));

for (const file of commandFiles) {
  const command = await import(`./commands/${file}`);
  client.commands.set(command.default.data.name, command.default);
}

client.once(Events.ClientReady, () => console.log(`🤖 Logged in as ${client.user.tag}`));

client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try { await command.execute(interaction); } 
    catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred)
        await interaction.followUp({ content: 'Error executing command!', ephemeral: true });
      else
        await interaction.reply({ content: 'Error executing command!', ephemeral: true });
    }
  } else if (interaction.isButton()) {
    const plate = interaction.customId.split("-")[1];
    const Car = (await import("./models/Cars.js")).default;
    const car = await Car.findOne({ plate, user: interaction.user.id });
    if (!car) return interaction.reply({ content: "🚫 Car not found or not yours.", ephemeral: true });
    await interaction.reply({ content: `🚗 Details:\n- Make: ${car.make}\n- Model: ${car.model}\n- Color: ${car.color}\n- Plate: ${car.plate}`, ephemeral: true });
  }
});

client.login(process.env.DISCORD_TOKEN);