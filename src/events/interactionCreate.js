import { logger } from '../utils/logger.js';
import { handleInteractionError } from '../utils/errorHandler.js';

export default {
  name: 'interactionCreate',
  async execute(interaction, client) {
    try {
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        await command.execute(interaction, null, client);
        return;
      }

      if (interaction.isButton()) {
        const button = client.buttons.get(interaction.customId);
        if (!button) return;
        await button.execute(interaction, client, []);
      }
    } catch (error) {
      logger.error('Music interaction failed:', error);
      await handleInteractionError(interaction, error, { type: 'music_interaction' }).catch(() => {});
    }
  },
};
