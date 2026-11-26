import { Events } from 'discord.js';
import { logger, startupLog } from '../utils/logger.js';
import { initRiffyAfterReady } from '../services/music/riffySetup.js';

export default {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    try {
      if (client.config?.bot?.presence) client.user.setPresence(client.config.bot.presence);
      startupLog(`Barracks Music connected as ${client.user.tag}`);
      startupLog(`Serving ${client.guilds.cache.size} Discord server(s)`);
      initRiffyAfterReady(client);
    } catch (error) {
      logger.error('Barracks Music ready event failed:', error);
    }
  },
};
