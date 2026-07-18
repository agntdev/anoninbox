import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { registerMainMenuItem, mainMenuKeyboard, inlineKeyboard, inlineButton } from "../toolkit/index.js";

registerMainMenuItem({ label: "✉️ Send message", data: "menu:send", order: 10 });

const WELCOME = "Welcome. Send any message and it will be forwarded anonymously to the owner. They can reply without revealing their identity.";

const composer = new Composer<Ctx>();

composer.command("start", async (ctx) => {
  await ctx.reply(WELCOME, { reply_markup: mainMenuKeyboard() });
});

composer.callbackQuery("menu:main", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText(WELCOME, { reply_markup: mainMenuKeyboard() });
});

composer.callbackQuery("menu:send", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText(
    "Send any message — text, photo, file, or voice. It will be forwarded anonymously to the owner.",
    { reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]) },
  );
});

export default composer;
