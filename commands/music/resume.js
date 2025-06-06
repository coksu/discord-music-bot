const { EmbedBuilder } = require('discord.js');
const { QueryType } = require('discord-player');

module.exports = {
    name: 'resume',
    async execute(message, args, client, player) {
        const queue = player.nodes.get(message.guild.id);
        if (!queue || !queue.connection || queue.node.isPlaying()) {
            return message.reply('Tidak ada lagu yang sedang dijeda.');
        }
        queue.node.resume();
        message.reply('▶️ Melanjutkan lagu.');
    }
};