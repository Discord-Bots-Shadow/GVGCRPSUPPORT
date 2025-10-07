import { Client, Collection, GatewayIntentBits, Events } from 'discord.js';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Create the client
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

// Load commands
client.commands = new Collection();
const commandsPath = path.resolve('./commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = await import(`./commands/${file}`);
  client.commands.set(command.default.data.name, command.default);
}

// Log ready
client.once(Events.ClientReady, () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// Interaction handler
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: '❌ Error executing command.', ephemeral: true });
    } else {
      await interaction.reply({ content: '❌ Error executing command.', ephemeral: true });
    }
  }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

client.login(process.env.DISCORD_TOKEN);
