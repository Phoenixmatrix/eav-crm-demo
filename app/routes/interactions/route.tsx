import { type LoaderFunctionArgs } from "react-router";
import { verifyKey } from "discord-interactions";
import { InteractionType, InteractionResponseType } from "discord-interactions";
import { z } from "zod";
import invariant from "tiny-invariant";

const applicationCommandSchema = z.object({
  type: z.union([
    z.literal(InteractionType.PING),
    z.literal(InteractionType.APPLICATION_COMMAND),
  ]),
  data: z
    .object({
      name: z.string(),
    })
    .optional(),
});

export const action = async ({ request, context }: LoaderFunctionArgs) => {
  const publicKey = context.cloudflare.env.PUBLIC_KEY;
  if (!publicKey) {
    throw new Error("PUBLIC_KEY is not defined");
  }

  const signature = request.headers.get("X-Signature-Ed25519");
  invariant(signature, "X-Signature-Ed25519 is not defined");
  const timestamp = request.headers.get("X-Signature-Timestamp");
  invariant(timestamp, "X-Signature-Timestamp is not defined");

  const body = await request.text();

  const isValidRequest = await verifyKey(body, signature, timestamp, publicKey);
  if (!isValidRequest) {
    return new Response("[discord-interactions] Invalid signature", {
      status: 401,
    });
  }

  const jsonBody = JSON.parse(body);
  const result = applicationCommandSchema.safeParse(jsonBody);
  if (!result.success) {
    return new Response(
      JSON.stringify({ error: "Invalid interaction payload" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (result.data.type == InteractionType.PING) {
    return new Response(JSON.stringify({ type: InteractionResponseType.PONG }));
  }

  const { data } = result.data;

  if (data?.name === "test") {
    return new Response(
      JSON.stringify({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: "Welcome to the Pile of Cats!" },
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response("OK", { status: 200 });
};
