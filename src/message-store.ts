// In-memory message store for the anonymous message forwarder.
// Production deployment should use Redis-backed persistent storage.
// This store is per-process; test harness gets a fresh bot per spec.

export interface StoredMessage {
  id: number;
  senderId: number;
  routingToken: string;
  contentType: string;
  content: string;
  timestamp: number;
  replied: boolean;
}

let nextId = 1;
const messagesById = new Map<number, StoredMessage>();
const messagesByToken = new Map<string, StoredMessage>();

export function storeMessage(
  senderId: number,
  contentType: string,
  content: string,
): StoredMessage {
  const id = nextId++;
  const routingToken = String(id);
  const msg: StoredMessage = {
    id,
    senderId,
    routingToken,
    contentType,
    content,
    timestamp: Date.now(),
    replied: false,
  };
  messagesById.set(id, msg);
  messagesByToken.set(routingToken, msg);
  return msg;
}

export function getMessageById(id: number): StoredMessage | undefined {
  return messagesById.get(id);
}

export function getMessageByToken(token: string): StoredMessage | undefined {
  return messagesByToken.get(token);
}

export function markReplied(token: string): void {
  const msg = messagesByToken.get(token);
  if (msg) msg.replied = true;
}
