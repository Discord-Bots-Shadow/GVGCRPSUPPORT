import mongoose from "mongoose";

const guildConfigSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  hostRoleId: { type: String, required: false },
  adminRoleId: { type: String, required: false },
});

export default mongoose.model("GuildConfig", guildConfigSchema);
