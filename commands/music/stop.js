module.exports = {
    name: 'stop',
    async execute(message, args, client, player) {
        const queue = player.nodes.get(message.guild.id);
        if (!queue || !queue.playing) return message.reply('Tidak ada yang diputar.');
        queue.delete();
        message.reply('🛑 Musik dihentikan.');
    }
};
