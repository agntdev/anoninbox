# Anonymous Message Forwarder — Bot specification

**Archetype:** custom

**Voice:** professional and concise — write every user-facing message, button label, error, and empty state in this voice.

A Telegram bot that acts as an anonymous intermediary between users and an owner. Users send messages (text, files, etc.) to the bot which forwards them to the owner's secure inbox. The owner replies through the bot without exposing their personal Telegram identity. All conversations are ephemeral and anonymous by design.

> This is the complete contract for the bot. Implement EVERY entry point, flow, feature, integration, and edge case below. The completeness review checks the bot against this document after each build pass.

## Primary audience

- General Telegram users seeking anonymity
- Single owner managing responses

## Success criteria

- Owner receives all user messages securely
- Owner identity remains hidden from users
- All messages expire after 30 days
- Ephemeral routing works for 72 hours

## Entry points

Every feature must be reachable from the bot's command/button surface (button-first; only /start and /help are slash commands).

- **/start** (command, actor: user, command: /start) — Open main menu with anonymous message instructions
- **Send anonymous message** (message, actor: user, command: /text|photo|audio|video|document|sticker|voice|location|contact) — Send any supported message type to the bot

## Flows

### Anonymous message flow
_Trigger:_ user sends message

1. User sends message to bot
2. Bot stores message temporarily
3. Bot sends confirmation: 'Message received anonymously.'
4. Bot forwards message to owner's secure inbox with routing token
5. Owner composes reply in web interface
6. Bot forwards reply to original sender using routing token

_Data touched:_ Incoming Message, Ephemeral Session

### Session expiration
_Trigger:_ 72 hours elapsed or owner replied

1. Delete routing token
2. Mark session as expired
3. Prevent further replies to original sender

## Data entities

Durable data (must survive a restart) uses the toolkit's persistent store, never in-memory maps.

- **Incoming Message** _(retention: persistent)_ — User-submitted content (text, files, etc.) with metadata
  - fields: content_type, payload, timestamp, file_links
- **Ephemeral Session** _(retention: session)_ — Temporary routing token for reply mapping
  - fields: session_token, sender_id_hash, expiry_time
- **Owner Reply** _(retention: none)_ — Owner's response to be forwarded to original sender
  - fields: reply_content, routing_token, timestamp

## Integrations

- **Telegram** (required) — Message routing and delivery
- **Secure Web Inbox** (required) — Owner message management interface
- **Email Service** (optional) — Notification fallback for owner
Call external APIs against their real contract (correct endpoints, ids, params); credentials from env. Do not fake responses.

## Owner controls

- Configure message retention period (default 30 days)
- Set reply window timeout (default 72 hours)
- Enable/disable email notifications
- View rich message previews in secure inbox

## Notifications

- New message alert with content preview for owner
- Session expiration warning before timeout

## Permissions & privacy

- User messages never expose owner's Telegram ID
- Ephemeral tokens auto-delete after use or timeout
- All user data stored encrypted
- No persistent user identifiers tracked

## Edge cases

- Expired session when owner delays reply
- Failed delivery to user (no retry mechanism)
- Large file uploads exceeding Telegram limits
- Spam message rate limiting

## Required tests

- End-to-end anonymous message delivery flow
- Session expiration behavior validation
- Owner reply routing verification
- Data retention and deletion policies

## Assumptions

- Web inbox is pre-configured and secured
- Default 72-hour reply window is sufficient
- File type validation is handled by Telegram API
- Owner has technical capability to manage web interface
