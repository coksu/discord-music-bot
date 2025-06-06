const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'queue',
    async execute(message, args, client, player) {
        const queue = player.nodes.get(message.guild.id);
        if (!queue || queue.tracks.size === 0) {
            return message.reply('Antrian lagu kosong.');
        }

        const now = queue.currentTrack;
        const tracks = queue.tracks.toArray();

        if (!now) {
            return message.reply('Tidak ada lagu yang sedang diputar saat ini.');
        }

        const embed = new EmbedBuilder()
            .setTitle('🎶 Antrian Lagu')
            .setColor('Purple');

        let description = `**Sedang diputar:** [${now.title}](${now.url}) \`[${now.duration}]\`\n\n`;

        if (tracks.length > 0) {
            description += `📜 **Berikutnya dalam Antrian:**\n`;
            description += tracks
                .slice(0, 10)
                .map((track, i) => `**${i + 1}.** [${track.title}](${track.url}) \`[${track.duration}]\``)
                .join('\n');

            if (tracks.length > 10) {
                description += `\n...dan ${tracks.length - 10} lagu lainnya.`;
            }
        } else {
            description += `Antrian kosong.`;
        }
        
        embed.setDescription(description);
        message.reply({ embeds: [embed] });
    }
};