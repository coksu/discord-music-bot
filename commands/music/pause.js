const { EmbedBuilder } = require('discord.js');
const { QueryType } = require('discord-player');

module.exports = {
    name: 'pause',
    async execute(message, args, client, player) {
        const queue = player.nodes.get(message.guild.id);
        if (!queue || !queue.connection || !queue.node.isPlaying()) {
            return message.reply('Tidak ada yang sedang diputar.');
        }
        queue.node.pause();
        message.reply('⏸️ Lagu dijeda.');
    }
};