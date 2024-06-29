import { Hono } from "hono";
import { verifyKey } from "discord-interactions";
import type { APIInteraction } from "discord-api-types/v10";
import {
  InteractionType,
  InteractionResponseType,
  APIInteractionResponse,
} from "discord-api-types/v10";
import satori, { init as initSatori } from "satori";
import initYoga from "yoga-wasm-web";
// @ts-ignore
import WASM_YOGA from "yoga-wasm-web/dist/yoga.wasm";

const yoga = await initYoga(WASM_YOGA);
initSatori(yoga);

type Bindings = {
  DISCORD_PUBLIC_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>()
  .get("/", (c) => {
    return c.text("OK");
  })
  .post(
    "/interaction",
    async (c, next) => {
      const signature = c.req.header("X-Signature-Ed25519")!;
      const timestamp = c.req.header("X-Signature-Timestamp")!;
      const body = await c.req.text();
      const isValid = await verifyKey(
        body,
        signature,
        timestamp,
        c.env["DISCORD_PUBLIC_KEY"]
      );

      if (!isValid) {
        return c.json({ status: 401, message: "Unauthorized" }, 401);
      }

      return next();
    },
    async (c) => {
      const interaction: APIInteraction = await c.req.json();

      if (interaction.type === InteractionType.Ping) {
        return c.json<APIInteractionResponse>({
          type: InteractionResponseType.Pong,
        });
      }

      if (
        interaction.type === InteractionType.ApplicationCommand &&
        interaction.data.name === "superchat"
      ) {
        return c.json<APIInteractionResponse>({
          type: InteractionResponseType.ChannelMessageWithSource,
          data: {
            content: "スーパーチャットを送りました！",
          },
        });
      }

      return c.json({ status: 400, message: "Bad Request" }, 400);
    }
  );

export default app;

// メモ:
// 横幅: 368
