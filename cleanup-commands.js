import { REST, Routes } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

async function cleanup() {
  try {
    console.log("🧹 Starting global command cleanup...");

    // Delete all global commands
    const globalCommands = await rest.get(Routes.applicationCommands(process.env.CLIENT_ID));
    for (const cmd of globalCommands) {
      await rest.delete(Routes.applicationCommand(process.env.CLIENT_ID, cmd.id));
      console.log(`❌ Deleted global command: ${cmd.name}`);
    }

    // Optionally delete per-guild commands (if you used test servers)
    // Replace YOUR_GUILD_ID below if needed
    // const guildCommands = await rest.get(Routes.applicationGuildCommands(process.env.CLIENT_ID, "YOUR_GUILD_ID"));
    // for (const cmd of guildCommands) {
    //   await rest.delete(Routes.applicationGuildCommand(process.env.CLIENT_ID, "YOUR_GUILD_ID", cmd.id));
    //   console.log(`❌ Deleted guild command: ${cmd.name}`);
    // }

    console.log("✅ Cleanup complete!");
  } catch (err) {
    console.error("⚠️ Error cleaning up commands:", err);
  }
}

cleanup();
