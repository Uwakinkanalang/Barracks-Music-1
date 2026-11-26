import 'dotenv/config';
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { REST } from '@discordjs/rest';
import express from 'express';
import config from './config/application.js';
import { logger, startupLog, shutdownLog } from './utils/logger.js';
import { loadCommands, registerCommands as registerSlashCommands } from './handlers/loaders/commandLoader.js';
import { initializeMusic } from './services/music/riffySetup.js';
import { shutdownMusic } from './services/music/playerHandler.js';

class BarracksMusic extends Client {
  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
      ],
    });
    this.config = config;
    this.commands = new Collection();
    this.buttons = new Collection();
    this.selectMenus = new Collection();
    this.modals = new Collection();
    this.cooldowns = new Collection();
    this.rest = new REST({ version: '10' }).setToken(config.bot.token);
  }

  async start() {
    try {
      startupLog('Starting Barracks Music...');
      await loadCommands(this);
      await this.loadMusicInteractions();
      initializeMusic(this);
      this.startWebServer();
      await this.login(this.config.bot.token);
      await registerSlashCommands(this, { clientId: this.config.bot.clientId });
      startupLog(`ONLINE | ${this.commands.size} music commands loaded`);
    } catch (error) {
      logger.error('Failed to start Barracks Music:', error);
      process.exit(1);
    }
  }

  async loadMusicInteractions() {
    const { default: musicButtons } = await import('./interactions/buttons/music/music.js');
    for (const button of musicButtons) this.buttons.set(button.name, button);
    startupLog(`Loaded ${this.buttons.size} music buttons`);
  }

  startWebServer() {
    const app = express();
    app.get('/', (_req, res) => res.json({ name: 'Barracks Music', status: 'online' }));
    app.get('/health', (_req, res) => res.json({
      status: 'healthy',
      uptime: process.uptime(),
      guilds: this.guilds.cache.size,
      musicCommands: this.commands.size,
      lavalink: Boolean(this.riffy),
    }));
    const port = Number(process.env.PORT || 3000);
    this.webServer = app.listen(port, '0.0.0.0', () => startupLog(`Health server listening on ${port}`));
  }

  async loadEvents() {
    const files = ['ready.js', 'interactionCreate.js', 'voiceStateUpdate.js'];
    for (const file of files) {
      const { default: event } = await import(`./events/${file}`);
      const handler = (...args) => Promise.resolve(event.execute(...args, this))
        .catch(error => logger.error(`Event ${event.name} failed:`, error));
      if (event.once) this.once(event.name, handler);
      else this.on(event.name, handler);
    }
  }
}

const bot = new BarracksMusic();
await bot.loadEvents();
process.once('SIGINT', () => bot.shutdown('SIGINT'));
process.once('SIGTERM', () => bot.shutdown('SIGTERM'));
bot.shutdown = async (reason = 'UNKNOWN') => {
  shutdownLog(`Barracks Music shutting down (${reason})`);
  await shutdownMusic(bot);
  if (bot.webServer) await new Promise(resolve => bot.webServer.close(resolve));
  bot.destroy();
  process.exit(0);
};
bot.start();
export default BarracksMusic;
