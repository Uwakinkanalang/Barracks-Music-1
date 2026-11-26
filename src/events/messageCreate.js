import { Events } from 'discord.js';
import { logger } from '../utils/logger.js';
import { parsePrefixCommand } from '../utils/prefixParser.js';
import { executePrefixCommand, supportsPrefixExecution } from '../utils/messageAdapter.js';
import { getCommandPrefix, isCommandCategoryEnabled } from '../config/bot.js';

const MUSIC_SHORTCUTS = new Set([
  'pause', 'resume', 'skip', 'stop', 'shuffle', 'loop',
  'remove', 'move', 'clear', 'volume', 'leave', '247',
]);

export default {
  name: Events.MessageCreate,
  async execute(message, client) {
    if (!message.guild || message.author.bot) return;

    try {
      const configuredPrefix = getCommandPrefix();
      const parsed = parsePrefixCommand(message.content, configuredPrefix)
        || (configuredPrefix === 'b!' ? null : parsePrefixCommand(message.content, 'b!'));
      if (!parsed) return;

      let { commandName, args } = parsed;
      const usedPrefix = message.content.startsWith('b!') ? 'b!' : configuredPrefix;

      if (MUSIC_SHORTCUTS.has(commandName)) {
        args = [commandName, ...args];
        commandName = 'music';
      }

      const command = client.commands.get(commandName);
      if (!command) return;
      if (!isCommandCategoryEnabled(command.category)) return;
      if (!supportsPrefixExecution(command)) return;

      logger.info(`Music prefix command: ${usedPrefix}${commandName} by ${message.author.tag}`);
      await executePrefixCommand(command, message, args, client, usedPrefix, null);
    } catch (error) {
      logger.error('Music prefix command failed:', error);
      await message.reply('There was an error running that music command.').catch(() => {});
    }
  },
};
