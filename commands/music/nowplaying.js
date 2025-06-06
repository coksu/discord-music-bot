const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'nowplaying',
    async execute(message, args, client, player) {
        const queue = player.nodes.get(message.guild.id);

        if (!queue || !queue.node.isPlaying()) { // Menggunakan queue.node.isPlaying()
            return message.reply('Tidak ada lagu yang sedang diputar saat ini.');
        }

        const track = queue.currentTrack;

        const embed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('🎧 Sedang Diputar')
            .setDescription(`**[${track.title}](${track.url})** oleh **${track.author}**\n\n`)
            .setThumbnail(track.thumbnail)
            .addFields(
                { name: 'Durasi', value: `\`${track.duration}\``, inline: true },
                { name: 'Diminta oleh', value: `${track.requestedBy.tag}`, inline: true }
            )
            .setFooter({ text: `Volume: ${queue.node.volume}%` });
        
        message.reply({ embeds: [embed] });
    }
};