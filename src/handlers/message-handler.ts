import { Composer, type Context } from "grammy";
import type { Ctx } from "../bot.js";
import { storeMessage } from "../message-store.js";
import { inlineButton, inlineKeyboard } from "../toolkit/index.js";

const OWNER_CHAT_ID = process.env.OWNER_CHAT_ID
  ? Number(process.env.OWNER_CHAT_ID)
  : undefined;

const composer = new Composer<Ctx>();

composer.on("message", async (ctx: Context, next) => {
  const msg = ctx.message;
  if (!msg) { await next(); return; }

  if (msg.text?.startsWith("/")) { await next(); return; }

  const senderId = ctx.from?.id;
  if (!senderId) { await next(); return; }

  let contentType = "text";
  let content = "";

  if (msg.text) {
    contentType = "text";
    content = msg.text;
  } else if (msg.photo) {
    contentType = "photo";
    content = msg.photo[msg.photo.length - 1].file_id;
  } else if (msg.audio) {
    contentType = "audio";
    content = msg.audio.file_id;
  } else if (msg.video) {
    contentType = "video";
    content = msg.video.file_id;
  } else if (msg.document) {
    contentType = "document";
    content = msg.document.file_id;
  } else if (msg.sticker) {
    contentType = "sticker";
    content = msg.sticker.file_id;
  } else if (msg.voice) {
    contentType = "voice";
    content = msg.voice.file_id;
  } else if (msg.location) {
    contentType = "location";
    content = `${msg.location.latitude},${msg.location.longitude}`;
  } else if (msg.contact) {
    contentType = "contact";
    content = msg.contact.phone_number;
  }

  const stored = storeMessage(senderId, contentType, content);

  const backToMenu = inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]);
  await ctx.reply("Message received anonymously.", { reply_markup: backToMenu });

  if (OWNER_CHAT_ID) {
    try {
      const preview =
        contentType === "text"
          ? content.slice(0, 100)
          : `[${contentType}]`;
      await ctx.api.sendMessage(
        OWNER_CHAT_ID,
        `📬 New anonymous message\n\n${preview}`,
        {
          reply_markup: inlineKeyboard([
            [inlineButton(`Reply #${stored.id}`, `reply:${stored.id}`)],
            [inlineButton("📬 View inbox", "inbox:show")],
          ]),
        },
      );
    } catch {
      // Owner may have blocked the bot or OWNER_CHAT_ID is invalid.
      // Non-fatal: message is stored; owner can view via inbox.
    }
  }
});

export default composer;
