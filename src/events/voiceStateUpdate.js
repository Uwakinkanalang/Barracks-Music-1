import { handleMusicVoiceState } from '../services/music/musicVoiceState.js';
import { logger } from '../utils/logger.js';

export default {
    name: 'voiceStateUpdate',
    async execute(oldState, newState, client) {
        if (client.config?.features?.music) {
            handleMusicVoiceState(client, oldState, newState).catch((error) => {
                logger.error('Music voice state handler error:', error);
            });
        }
    }
};
