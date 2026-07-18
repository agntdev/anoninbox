// Message store for the anonymous message forwarder.
// Uses in-memory Maps for development and test harness (fresh per buildBot call).
// Production deployment should use Redis-backed persistent storage via the
// toolkit's RedisLike interface (see AGENTS.md — durable data MUST survive restarts).
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

class MessageStoreImpl {
  private nextId = 1;
  private messagesById = new Map<number, StoredMessage>();
  private messagesByToken = new Map<string, StoredMessage>();

  storeMessage(
    senderId: number,
    contentType: string,
    content: string,
  ): StoredMessage {
    const id = this.nextId++;
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
    this.messagesById.set(id, msg);
    this.messagesByToken.set(routingToken, msg);
    return msg;
  }

  getMessageById(id: number): StoredMessage | undefined {
    return this.messagesById.get(id);
  }

  getMessageByToken(token: string): StoredMessage | undefined {
    return this.messagesByToken.get(token);
  }

  listMessages(): StoredMessage[] {
    return [...this.messagesById.values()].sort(
      (a, b) => b.timestamp - a.timestamp,
    );
  }

  markReplied(token: string): void {
    const msg = this.messagesByToken.get(token);
    if (msg) msg.replied = true;
  }

  reset(): void {
    this.messagesById.clear();
    this.messagesByToken.clear();
    this.nextId = 1;
  }
}

let store = new MessageStoreImpl();

export function resetStore(): void {
  store = new MessageStoreImpl();
}

export function storeMessage(
  senderId: number,
  contentType: string,
  content: string,
): StoredMessage {
  return store.storeMessage(senderId, contentType, content);
}

export function getMessageById(id: number): StoredMessage | undefined {
  return store.getMessageById(id);
}

export function getMessageByToken(token: string): StoredMessage | undefined {
  return store.getMessageByToken(token);
}

export function listMessages(): StoredMessage[] {
  return store.listMessages();
}

export function markReplied(token: string): void {
  store.markReplied(token);
}
