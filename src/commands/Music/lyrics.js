import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';
import { getPlayer } from '../../services/music/musicActions.js';

const LRCLIB_API = 'https://lrclib.net/api/search';
const USER_AGENT = 'Barracks-Music-1 (https://github.com/Uwakinkanalang/Barracks-Music-1)';
const PUBLIC_DOMAIN_TITLES = new Set(['amazing grace', 'auld lang syne']);

function normalizeTitle(value) {
    return String(value || '').toLocaleLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function getFullLyrics(record) {
    const source = record.plainLyrics || record.syncedLyrics || '';
    return source.replace(/^\uFEFF/, '').replace(/^\s*\[\d{1,2}:\d{2}(?:\.\d{1,3})?\]\s*/gm, '').trim();
}

async function searchLyrics(query) {
    const url = new URL(LRCLIB_API);
    url.searchParams.set('q', query);
    const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(10_000) });
    if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        throw new Error('Lyrics service rate limit reached. Try again ' + (retryAfter ? 'in ' + retryAfter + ' seconds' : 'later') + '.');
    }
    if (!response.ok) throw new Error(response.status === 404 ? 'No lyrics were found for that song.' : 'The lyrics service is temporarily unavailable. Please try again later.');
    const records = await response.json();
    return Array.isArray(records) ? records.find((record) => record.plainLyrics || record.syncedLyrics || record.instrumental) : null;
}

export default {
    category: 'Music',
    data: new SlashCommandBuilder()
        .setName('lyrics')
        .setDescription('Find lyrics for a song or the currently playing track')
        .addStringOption((option) => option.setName('song').setDescription('Song title and artist (defaults to the currently playing track)').setRequired(false).setMaxLength(200)),

    async execute(interaction, config, client) {
        await InteractionHelper.safeDefer(interaction, { flags: MessageFlags.Ephemeral });
        try {
            let query = interaction.options.getString('song');
            if (!query) {
                const current = getPlayer(client, interaction.guildId)?.current?.info;
                if (!current?.title) {
                    await InteractionHelper.safeEditReply(interaction, { content: 'Nothing is playing. Provide a song name with `/lyrics song:`.' });
                    return;
                }
                query = (current.title + ' ' + (current.author || '')).trim();
            }
            const record = await searchLyrics(query);
            if (!record) {
                await InteractionHelper.safeEditReply(interaction, { content: 'No lyrics were found for that song.' });
                return;
            }
            const title = record.trackName || record.name || query;
            const artist = record.artistName || 'Unknown artist';
            const lyrics = getFullLyrics(record);
            const isPublicDomain = PUBLIC_DOMAIN_TITLES.has(normalizeTitle(title));
            const lyricsUrl = record.id ? 'https://lrclib.net/api/get/' + record.id : 'https://lrclib.net';
            const canDisplayFullLyrics = isPublicDomain && lyrics && lyrics.length <= 3800;
            const embed = new EmbedBuilder()
                .setColor(0x5865F2)
                .setTitle(canDisplayFullLyrics ? 'Full Lyrics' : 'Lyrics')
                .setDescription(record.instrumental ? 'This track is marked as instrumental.' : canDisplayFullLyrics ? lyrics : 'Open the lyrics source below to read the full lyrics.')
                .addFields(
                    { name: 'Song', value: title.slice(0, 256), inline: true },
                    { name: 'Artist', value: artist.slice(0, 256), inline: true },
                    { name: 'Full lyrics', value: '[Open full lyrics](' + lyricsUrl + ')' },
                )
                .setFooter({ text: 'Lyrics source: LRCLIB' });
            await InteractionHelper.safeEditReply(interaction, { embeds: [embed] });
        } catch (error) {
            await InteractionHelper.safeEditReply(interaction, { content: error.name === 'TimeoutError' ? 'The lyrics search timed out. Please try again.' : (error.message || 'Could not retrieve lyrics right now.') });
        }
    },
};
