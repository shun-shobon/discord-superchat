import {
  ApplicationCommandOptionType,
  RESTPostAPIApplicationCommandsJSONBody,
  Routes,
} from "discord-api-types/v10";
import { REST } from "@discordjs/rest";
import { config } from "dotenv";

config();

const superchat: RESTPostAPIApplicationCommandsJSONBody = {
  name: "superchat",
  description: "スーパーチャットを送ります",
  options: [
    {
      type: ApplicationCommandOptionType.Integer,
      name: "金額",
      description: "スーパーチャットの金額",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "コメント",
      description: "スーパーチャットのコメント",
    },
  ],
};

const token = process.env["DISCORD_TOKEN"]!;
const applicationId = process.env["DISCORD_APPLICATION_ID"]!;
const guildId = process.env["DISCORD_GUILD_ID"]!;

const rest = new REST({ version: "10" }).setToken(token);

// await rest.put(Routes.applicationGuildCommands(applicationId, guildId), {
//   body: [superchat],
// });

await rest.put(Routes.applicationCommands(applicationId), {
  body: [superchat],
});
