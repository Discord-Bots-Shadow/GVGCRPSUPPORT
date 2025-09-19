import express from "express";
import dotenv from "dotenv";
import { Client, GatewayIntentBits, Events, Collection } from "discord.js";
import fs from "fs";
import fetch from "node-fetch"; // per pingare Replit

dotenv.config();

const app = express();
app.get("/", (req, res) => {
  res.send("Bot is alive!");
});

// 🔹 Usa la porta dinamica di Replit
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ KeepAlive attivo su porta ${PORT}`);
});

// 🔹 URL del tuo Replit da pingare
const REPL_URL = "https://7d1f2a55-4761-4ab7-8f85-d4f4f5c4ddf3-00-2t71xt0gt7eeh.riker.replit.dev/"; // <--- cambia qui con l'URL esatto

// Ping a Replit ogni minuto per tenerlo sveglio
setInterval(() => {
  fetch(REPL_URL)
    .then(res => console.log(`Ping a ${REPL_URL} -> ${res.status}`))
    .catch(err => console.error("Errore nel ping:", err));
}, 60 * 1000);

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = await import(`./commands/${file}`);
  client.commands.set(command.default.data.name, command.default);
}

client.once(Events.ClientReady, () => {
