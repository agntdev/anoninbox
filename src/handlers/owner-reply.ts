import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { getMessageById, markReplied } from "../message-store.js";

const composer = new Composer<Ctx>();

composer.callbackQuery(/^reply:(\d+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const token = ctx.match[1];
  ctx.session.pendingReplyTo = token;
  await ctx.reply("Type your reply to the anonymous sender:", {
    reply_parameters: { message_id: ctx.callbackQuery.message?.message_id ?? 0 },
  });
});

composer.command("reply", async (ctx) => {
  const text = ctx.message?.text ?? "";
  const parts = text.split(" ");
  if (parts.length < 2) {
    await ctx.reply("Usage: /reply <token> <your message>");
    return;
  }
  const token = parts[1];
  const replyContent = parts.slice(2).join(" ");
  if (!replyContent) {
    await ctx.reply("Usage: /reply <token> <your message>");
    return;
  }

  const msg = getMessageById(Number(token));
  if (!msg) {
    await ctx.reply("Message not found or expired.");
    return;
  }

  try {
    await ctx.api.sendMessage(msg.senderId, `Reply from owner:\n${replyContent}`);
    markReplied(token);
    await ctx.reply("Reply sent.");
  } catch {
    await ctx.reply("Could not deliver reply. The sender may have blocked the bot.");
  }
});

composer.on("message", async (ctx, next) => {
  const pending = ctx.session.pendingReplyTo;
  if (!pending) {
    await next();
    return;
  }
  if (ctx.message?.text?.startsWith("/")) {
    ctx.session.pendingReplyTo = undefined;
    await next();
    return;
  }

  ctx.session.pendingReplyTo = undefined;

  const msg = getMessageById(Number(pending));
  if (!msg) {
    await ctx.reply("Message not found or expired.");
    return;
  }

  const replyContent = ctx.message?.text;
  if (!replyContent) {
    await ctx.reply("Only text replies are supported.");
    return;
  }

  try {
    await ctx.api.sendMessage(msg.senderId, `Reply from owner:\n${replyContent}`);
    markReplied(pending);
    await ctx.reply("Reply sent.");
  } catch {
    await ctx.reply("Could not deliver reply. The sender may have blocked the bot.");
  }
});

export default composer;
