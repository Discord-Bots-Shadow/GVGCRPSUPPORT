import express from "express";
import dotenv from "dotenv";
import { Client, GatewayIntentBits, Events, Collection } from "discord.js";
import fs from "fs";

dotenv.config();

// Keep-Alive con Express (per Render / UptimeRobot)
const app = express();
app.get("/", (req, res) => {
  res.send("Bot is alive!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ KeepAlive attivo su porta ${PORT}`);
});

// Discord Client
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// Caricamento comandi
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = await import(`./commands/${file}`);
  client.commands.set(command.default.data.name, command.default);
}

// Eventi
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
        await interaction.followUp({ content: '❌ Errore eseguendo il comando!', ephemeral: true });
      } else {
        await interaction.reply({ content: '❌ Errore eseguendo il comando!', ephemeral: true });
      }
    }
  } else if (interaction.isButton()) {
    const customId = interaction.customId;
    if (customId.startsWith('car-')) {
      const plate = customId.slice(4);
      const db = JSON.parse(fs.readFileSync('database.json'));
      const car = db.find(c => c.plate === plate && c.user === interaction.user.id);

      if (!car) {
        await interaction.reply({ content: "🚫 Auto non trovata o non è tua.", ephemeral: true });
        return;
      }

      await interaction.reply({
        content: `🚗 **Dettagli auto:**\n- Marca: ${car.make}\n- Modello: ${car.model}\n- Colore: ${car.color}\n- Targa: ${car.plate}`,
        ephemeral: true
      });
    }
  }
});

// Login
client.login(process.env.TOKEN);