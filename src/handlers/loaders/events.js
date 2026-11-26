import { logger } from '../../utils/logger.js';

const MUSIC_EVENTS = ['ready.js', 'interactionCreate.js', 'voiceStateUpdate.js'];

export default async function loadEvents(client) {
  for (const file of MUSIC_EVENTS) {
    const { default: event } = await import(`../../events/${file}`);
    const handler = (...args) => Promise.resolve(event.execute(...args, client))
      .catch(error => logger.error(`Music event ${event.name} failed:`, error));
    if (event.once) client.once(event.name, handler);
    else client.on(event.name, handler);
  }
}
