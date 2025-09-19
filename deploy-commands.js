import { REST, Routes } from 'discord.js';
import fs from 'fs';

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(f => f.endsWith('.js'));
for (const file of commandFiles) {
  const command = await import(`./commands/${file}`);
  commands.push(command.default.data.toJSON());
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

try {
  console.log('⏳ Deploying commands...');
  await rest.put(
    Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
    { body: commands }
  );
  console.log('✅ Commands deployed!');
} catch (err) { console.error(err); }