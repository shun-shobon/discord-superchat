import { Hono } from "hono";
import { verifyKey } from "discord-interactions";
import { APIInteraction, MessageFlags } from "discord-api-types/v10";
import {
  InteractionType,
  InteractionResponseType,
  APIInteractionResponse,
  ApplicationCommandType,
  ApplicationCommandOptionType,
} from "discord-api-types/v10";
import { init as initSatori } from "satori";
import initYoga from "yoga-wasm-web";
// @ts-ignore
import WASM_YOGA from "yoga-wasm-web/dist/yoga.wasm";
import { initWasm } from "@resvg/resvg-wasm";
// @ts-ignore
import WASM_RESVG from "@resvg/resvg-wasm/index_bg.wasm";
import { generateImage } from "./superchat";

const yoga = await initYoga(WASM_YOGA);
initSatori(yoga);

await initWasm(WASM_RESVG);

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
        interaction.data.type === ApplicationCommandType.ChatInput &&
        interaction.data.name === "superchat"
      ) {
        const price = interaction.data.options
          ?.filter((o) => o.type === ApplicationCommandOptionType.Integer)
          .find((o) => o.name === "金額")?.value!;

        const message = interaction.data.options
          ?.filter((o) => o.type === ApplicationCommandOptionType.String)
          .find((o) => o.name === "コメント")?.value;

        const name =
          interaction.member?.nick ??
          interaction.member?.user.global_name ??
          "unknown";

        const errorMessage = validateParams(price, message);
        if (errorMessage != null) {
          return c.json<APIInteractionResponse>({
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
              content: errorMessage,
              flags: MessageFlags.Ephemeral,
            },
          });
        }

        const image = await generateImage({ price, message, name });

        const formData = new FormData();

        const payload: APIInteractionResponse = {
          type: InteractionResponseType.ChannelMessageWithSource,
          data: {
            attachments: [
              {
                id: 0,
                filename: "image.png",
              },
            ],
          },
        };

        formData.set("payload_json", JSON.stringify(payload));
        formData.set(
          "files[0]",
          new Blob([image], { type: "image/png" }),
          "image.png"
        );

        return new Response(formData, {
          status: 200,
        });
      }
    }
  );

export default app;

function validateParams(price: number, message?: string): string | null {
  if (price < 100 || price > 50000) {
    return "金額は100円〜50,000円の間で指定してください";
  }

  const maxLength = Object.entries(MESSAGE_MAX_LENGTH_MAP).reduce(
    (acc, [key, value]) => {
      if (parseInt(key) <= price) {
        return value;
      }
      return acc;
    },
    0
  );

  if (message != null && maxLength < [...message].length) {
    return maxLength === 0
      ? `200円未満のスーパーチャットにはコメントを付けることはできません`
      : `コメントは${maxLength}文字以内で指定してください`;
  }

  return null;
}

const MESSAGE_MAX_LENGTH_MAP: Record<number, number> = {
  100: 0,
  200: 50,
  500: 150,
  1000: 200,
  2000: 225,
  5000: 250,
  10000: 270,
  20000: 290,
  30000: 310,
  40000: 330,
  50000: 350,
};
