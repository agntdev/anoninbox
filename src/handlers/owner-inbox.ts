import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { listMessages } from "../message-store.js";
import { registerMainMenuItem, inlineButton, inlineKeyboard } from "../toolkit/index.js";

registerMainMenuItem({ label: "📬 Inbox", data: "inbox:show", order: 5 });

const composer = new Composer<Ctx>();

composer.callbackQuery("inbox:show", async (ctx) => {
  await ctx.answerCallbackQuery();
  const messages = listMessages();

  if (messages.length === 0) {
    await ctx.editMessageText("No messages yet.", {
      reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]),
    });
    return;
  }

  const preview = messages
    .slice(0, 10)
    .map((msg, i) => {
      const status = msg.replied ? "✅" : "⏳";
      const preview =
        msg.contentType === "text"
          ? msg.content.slice(0, 60)
          : `[${msg.contentType}]`;
      return `${i + 1}. ${status} ${preview}`;
    })
    .join("\n");

  const buttons = messages
    .slice(0, 10)
    .map((msg) => [
      inlineButton(`Reply #${msg.id}`, `reply:${msg.id}`),
    ]);

  buttons.push([inlineButton("⬅️ Back to menu", "menu:main")]);

  await ctx.editMessageText(
    `📬 ${messages.length} message${messages.length === 1 ? "" : "s"}\n\n${preview}`,
    { reply_markup: inlineKeyboard(buttons) },
  );
});

export default composer;
