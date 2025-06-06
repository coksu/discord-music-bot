const { EmbedBuilder } = require('discord.js');
const { QueryType } = require('discord-player');

module.exports = {
    name: 'stop',
    async execute(message, args, client, player) {
        const queue = player.nodes.get(message.guild.id);
        if (!queue || !queue.connection) {
            return message.reply('Tidak ada yang diputar.');
        }
        
        queue.delete();
        message.reply('🛑 Musik dihentikan dan bot keluar dari voice channel.');
    }
};