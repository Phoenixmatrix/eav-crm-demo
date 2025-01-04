import type { Command } from "./commands";

const discordApiBaseUrl = "https://discord.com/api/v10/";

type DiscordRequestOptions = {
  body?: unknown;
  method: "POST" | "GET" | "PUT" | "DELETE";
  discordToken: string;
};

export async function createDiscordRequest(
  endpoint: string,
  options: DiscordRequestOptions
) {
  const url = new URL(endpoint, discordApiBaseUrl);
  const body = options.body ? JSON.stringify(options.body) : undefined;

  const headers = {
    Authorization: `Bot ${options.discordToken}`,
    "Content-Type": "application/json; charset=utf-8",
  };
  const response = await fetch(url, {
    method: options.method,
    headers,
    body,
  });

  if (!response.ok) {
    console.log();
    throw new Error(
      `Discord api request failed with status ${response.status}. ${
        response.statusText
      }. Error message: ${await response.text()}`
    );
  }

  return response;
}
