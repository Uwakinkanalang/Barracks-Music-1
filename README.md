# Barracks Music 1

A standalone Discord music bot for the Barracks community. It uses Discord.js v14, Riffy, and Lavalink v4. This repository contains music playback only; moderation, economy, leveling, giveaways, tickets, and other community features have been removed.

## Commands

- `/play query:` Play a song, URL, or playlist
- `/join` Join your voice channel
- `/queue` Show the current track and queue
- `/nowplaying` Show the current track
- `/music pause|resume|skip|stop|shuffle|loop|volume|seek|remove|move|clear|leave|247`

## Railway variables

- `DISCORD_TOKEN` — token for the Discord music bot application
- `GUILD_ID` — optional; register commands instantly in one test server
- `LAVALINK_HOST` — e.g. `lavalink.railway.internal`
- `LAVALINK_PORT` — `2333`
- `LAVALINK_PASSWORD` — Lavalink server password
- `LAVALINK_SECURE` — `false` for Railway private networking
- `LAVALINK_SEARCH_PLATFORM` — `ytmsearch`

Use Node.js 20.10 or newer. Railway runs `npm start`. Keep your Discord token and Lavalink password private.

## Run locally

1. Copy `.env.example` to `.env` and fill in your values.
2. Run `npm install`.
3. Run `npm start`.
