import express from "express";
import { Client, GatewayIntentBits, Events, Collection } from "discord.js";
import fs from "fs";
import mongoose from "mongoose";

// Keep-Alive Express
const app = express();
app.get("/", (req, res) => res.send("Bot is alive!"));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ KeepAlive attivo su porta ${PORT}`));

// Keep-Alive Ping (opzionale)
const REPL_URL = process.env.KEEP_ALIVE_URL;
if (REPL_URL) {
  import('node-fetch').then(({default: fetch}) => {
    setInterval(() => {
      fetch(REPL_URL).then(res => console.log(`Ping a ${REPL_URL} -> ${res.status}`))
      .catch(err => console.error("Errore ping:", err));
    }, 10 * 60 * 1000);
  });
}

// MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connesso a MongoDB"))
  .catch(err => console.error("❌ Errore MongoDB:", err));

// Client Discord
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

// Carica comandi
const commandFiles = fs.readdirSync('./commands').filter(f => f.endsWith('.js'));
for (const file of commandFiles) {
  const command = await import(`./commands/${file}`);
  client.commands.set(command.default.data.name, command.default);
}

// Eventi
client.once(Events.ClientReady, () => console.log(`🤖 Logged in as ${client.user.tag}`));

client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try { await command.execute(interaction); }
    catch(err) {
      console.error(err);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'Errore eseguendo il comando!', ephemeral: true });
      } else {
        await interaction.reply({ content: 'Errore eseguendo il comando!', ephemeral: true });
      }
    }
  } else if (interaction.isButton()) {
    const customId = interaction.customId;
    if (customId.startsWith('car-')) {
      const plate = customId.slice(4);
      const db = await mongoose.model('Car').findOne({ plate, user: interaction.user.id });
      if (!db) return interaction.reply({ content: "🚫 Auto non trovata o non tua.", ephemeral: true });
      await interaction.reply({
        content: `🚗 Dettagli auto:\n- Marca: ${db.make}\n- Modello: ${db.model}\n- Colore: ${db.color}\n- Targa: ${db.plate}`,
        ephemeral: true
      });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);