import { REST, Routes } from 'discord.js';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
  const command = await import(`./commands/${file}`);
  commands.push(command.default.data.toJSON());
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('⏳ Deploying global commands...');
    
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log('🌍 Global commands deployed successfully!');
    console.log('⚠️ Note: It can take up to 1 hour for changes to appear globally.');
  } catch (err) {
    console.error('❌ Error deploying commands:', err);
  }
})();
