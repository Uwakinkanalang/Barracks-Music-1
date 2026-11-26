# Barracks Music

A dedicated Discord music bot powered by **Discord.js v14**, **Riffy**, and **Lavalink v4**.

## Music features

- Play tracks by search, YouTube URL, or playlist URL
- YouTube Music search by default (through the configured Lavalink source)
- Queue display with pagination
- Now playing panel with interactive controls
- Pause, resume, skip, stop, shuffle, loop, volume, seek, remove, move, and clear
- Join and leave voice channels
- 24/7 voice mode
- Railway-friendly health endpoint

## Commands

- `/play query:<song, URL, or playlist>`
- `/join`
- `/queue`
- `/nowplaying`
- `/music pause`
- `/music resume`
- `/music skip`
- `/music stop`
- `/music shuffle`
- `/music loop mode:<off|track|queue>`
- `/music volume level:<0-100>`
- `/music seek seconds:<seconds>`
- `/music remove position:<number>`
- `/music move from:<number> to:<number>`
- `/music clear`
- `/music leave`
- `/music 247 enabled:<true|false>`

## Railway environment variables

Required:
- `DISCORD_TOKEN` — Discord bot token
- `CLIENT_ID` — Discord application/bot ID

Lavalink connection (choose one configuration style):

```env
LAVALINK_HOST=your-lavalink-host
LAVALINK_PORT=2333
LAVALINK_PASSWORD=your-lavalink-password
LAVALINK_SECURE=false
LAVALINK_SEARCH_PLATFORM=ytmsearch
```

Or set `LAVALINK_NODES` to a JSON array of nodes. For a Railway Lavalink service, use its private hostname and port when both services are in the same Railway project/network. Use the public hostname and TLS setting only when connecting over the public network.

## Deploy

1. Connect this repository to a Railway service.
2. Set `DISCORD_TOKEN`, `CLIENT_ID`, and the Lavalink variables.
3. Ensure the bot service can reach your Lavalink service.
4. Deploy with `npm start`.

The bot exposes `/` and `/health` HTTP endpoints for hosting health checks.

## Required Discord permissions

- View Channels
- Send Messages
- Embed Links
- Read Message History
- Connect
- Speak
- Use Application Commands

Enable the **Guilds** and **Guild Voice States** intents. No message-content intent is required for the slash-command music bot.
