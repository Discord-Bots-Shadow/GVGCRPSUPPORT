import express from "express";
import dotenv from "dotenv";
import { Client, GatewayIntentBits, Events, Collection } from "discord.js";
import fs from "fs";
import mongoose from "mongoose";
import fetch from "node-fetch";

dotenv.config();

// 🔹 Keep-Alive Express
const app = express();
app.get("/", (req, res) => {
  res.send("Bot is alive!");
});

// Porta dinamica
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ KeepAlive attivo su porta ${PORT}`);
});

// 🔹 Ping URL esterno (Uptime Robot o altro)
const REPL_URL = process.env.KEEP_ALIVE_URL;
if (REPL_URL) {
  setInterval(() => {
    fetch(REPL_URL)
      .then(res => console.log(`Ping a ${REPL_URL} -> ${res.status}`))
      .catch(err => console.error("Errore nel ping:", err));
  }, 10 * 60 * 1000); // ogni 10 minuti
}

// 🔹 Connetti a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// 🔹 Client Discord
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// 🔹 Comandi
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = await import(`./commands/${file}`);
  client.commands.set(command.default.data.name, command.default);
}

// 🔹 Eventi
client.once(Events.ClientReady, () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: '❌ Error executing the command!', ephemeral: true });
      } else {
        await interaction.reply({ content: '❌ Error executing the command!', ephemeral: true });
      }
    }
  } else if (interaction.isButton()) {
    const customId = interaction.customId;
    if (customId.startsWith('car-')) {
      const plate = customId.slice(4);
      const Car = (await import('./models/Car.js')).default;
      const car = await Car.findOne({ plate, user: interaction.user.id });
      if (!car) {
        await interaction.reply({ content: "🚫 Car not found or not yours.", ephemeral: true });
        return;
      }
      await interaction.reply({
        content: `🚗 **Car details:**\n- Make: ${car.make}\n- Model: ${car.model}\n- Color: ${car.color}\n- Plate: ${car.plate}`,
        ephemeral: true
      });
    }
  }
});

// 🔹 Login Discord
client.login(process.env.DISCORD_TOKEN);