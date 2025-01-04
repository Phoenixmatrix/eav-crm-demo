import type { Command } from "./commands";
import * as commands from "./commands";
import z from "zod";

import { createDiscordRequest } from "./requests";

const envSchema = z.object({
  DISCORD_APP_ID: z.string(),
  DISCORD_BOT_TOKEN: z.string(),
});

type InstallCommandsOptions = {
  discordToken: string;
};

async function installCommands(
  appId: string,
  commands: Command[],
  options: InstallCommandsOptions
) {
  try {
    await createDiscordRequest(`applications/${appId}/commands`, {
      body: commands,
      method: "PUT",
      discordToken: options.discordToken,
    });
  } catch (error) {
    console.error("Failed to install commands", error);
  }
}

declare const process: {
  env: {
    [key: string]: string | undefined;
  };
};

const commandsPayload = Object.values(commands).map((command) => command);
const env = envSchema.parse(process.env);

await installCommands(env.DISCORD_APP_ID, commandsPayload, {
  discordToken: env.DISCORD_BOT_TOKEN,
});

console.log("Commands successfully registered");
