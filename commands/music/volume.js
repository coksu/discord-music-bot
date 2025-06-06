module.exports = {
    name: 'volume',
    async execute(message, args, client, player) {
        const queue = player.nodes.get(message.guild.id);
        if (!queue || !queue.playing) return message.reply('Tidak ada yang diputar.');

        const vol = parseInt(args[0]);
        if (!vol || vol < 1 || vol > 100) {
            return message.reply(`🔊 Volume saat ini: ${queue.node.volume}%`);
        }

        queue.node.setVolume(vol);
        message.reply(`🔊 Volume diatur ke ${vol}%`);
    }
};
