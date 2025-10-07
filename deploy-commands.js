import { REST, Routes } from 'discord.js';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config(); // Load .env variables

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
  const { default: command } = await import(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

try {
  console.log('⏳ Deploying commands...');
  await rest.put(
    Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
    { body: commands }
  );
  console.log('✅ Commands deployed successfully!');
} catch (err) {
  console.error('❌ Failed to deploy commands:', err);
}
