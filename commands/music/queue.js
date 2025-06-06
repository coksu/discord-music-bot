module.exports = {
    name: 'queue',
    async execute(message, args, client, player) {
        const queue = player.nodes.get(message.guild.id);
        if (!queue || !queue.tracks || queue.tracks.size === 0)
            return message.reply('Antrian lagu kosong.');

        const tracks = queue.tracks.toArray();
        const now = queue.currentTrack;

        let response = `🎶 **Sedang diputar:** ${now.title} [${now.duration}]\n\n📜 **Antrian:**\n`;

        tracks.slice(0, 10).forEach((track, i) => {
            response += `${i + 1}. ${track.title} [${track.duration}]\n`;
        });

        if (tracks.length > 10) response += `...dan ${tracks.length - 10} lagu lainnya`;

        message.reply(response);
    }
};
