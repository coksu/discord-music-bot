const { EmbedBuilder } = require('discord.js');
const { QueryType } = require('discord-player');

module.exports = {
    name: 'skip',
    async execute(message, args, client, player) {
        const queue = player.nodes.get(message.guild.id);
        if (!queue || !queue.connection || !queue.node.isPlaying()) {
            return message.reply('Tidak ada lagu yang sedang diputar.');
        }

        const success = await queue.node.skip();

        if (success) {
            message.reply('⏭️ Lagu di-skip!');
        } else {
            message.reply('Tidak ada lagu berikutnya dalam antrian untuk di-skip.');
        }
    }
};