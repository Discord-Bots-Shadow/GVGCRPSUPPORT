client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "❌ There was an error executing this command.",
        ephemeral: true,
      });
    } else {
      await interaction.followUp({
        content: "❌ There was an error executing this command.",
        ephemeral: true,
      });
    }
  }
});
