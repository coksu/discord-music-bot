module.exports = {
    name: 'resume',
    async execute(message, args, client, player) {
        const queue = player.nodes.get(message.guild.id);
        if (!queue || !queue.connection) return message.reply('Tidak ada lagu yang diputar.');
        queue.node.resume();
        message.reply('▶️ Melanjutkan lagu.');
    }
};
