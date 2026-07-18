import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { registerMainMenuItem } from "../toolkit/index.js";

registerMainMenuItem({ label: "📎 Media", data: "media:info", order: 30 });

const composer = new Composer<Ctx>();

composer.callbackQuery("media:info", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply("Send any supported media — it will be forwarded anonymously.");
});

export default composer;
