module.exports = {
    name: 'skip',
    async execute(message, args, client, player) {
        const queue = player.nodes.get(message.guild.id);
        if (!queue || !queue.playing) return message.reply('Tidak ada lagu yang sedang diputar.');
        await queue.node.skip();
        message.reply('⏭️ Lagu di-skip!');
    }
};
