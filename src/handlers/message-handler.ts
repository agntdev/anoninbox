import { Composer, type Context } from "grammy";
import type { Ctx } from "../bot.js";
import { storeMessage } from "../message-store.js";
import { inlineButton, inlineKeyboard } from "../toolkit/index.js";

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

  storeMessage(senderId, contentType, content);

  const backToMenu = inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]);
  await ctx.reply("Message received anonymously.", { reply_markup: backToMenu });
});

export default composer;
