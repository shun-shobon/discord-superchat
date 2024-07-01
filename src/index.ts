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

        // if (price == null || price < 100 || 50000 < price) {
        //   return c.json<APIInteractionResponse>({
        //     type: InteractionResponseType.ChannelMessageWithSource,
        //     data: {
        //       content: "金額は100円〜50,000円の間で指定してください",
        //       flags: MessageFlags.Ephemeral,
        //     },
        //   });
        // }

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

// メモ:
// 横幅: 368
