module.exports = {
    name: 'pause',
    async execute(message, args, client, player) {
        const queue = player.nodes.get(message.guild.id);
        if (!queue || !queue.playing) return message.reply('Tidak ada yang sedang diputar.');
        queue.node.pause();
        message.reply('⏸️ Lagu dijeda.');
    }
};
