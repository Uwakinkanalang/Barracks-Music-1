import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';
import { playQuery, replyMusicSuccess } from '../../services/music/musicActions.js';

export default {
    prefixOnly: true,
    category: 'Music',
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song, YouTube link, or playlist')
        .addStringOption((opt) =>
            opt.setName('query').setDescription('Song name, YouTube URL, or playlist URL').setRequired(true),
        ),

    async execute(interaction, config, client) {
        const deferred = await InteractionHelper.safeDefer(interaction, { flags: MessageFlags.Ephemeral });
        if (!deferred) return;
        const result = await playQuery(client, interaction, interaction.options.getString('query'));
        await replyMusicSuccess(interaction, result.embed);
    },

    async prefixExecute(interaction, config, client) {
        const query = (interaction.options._hoistedOptions || []).map(option => option.value).join(' ').trim();
        if (!query) {
            await interaction.reply({ content: 'Usage: `b!play <song name or URL>`' });
            return;
        }
        const result = await playQuery(client, interaction, query);
        await replyMusicSuccess(interaction, result.embed);
    },
};
