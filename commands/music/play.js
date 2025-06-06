// commands/music/play.js

const { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const { QueryType } = require('discord-player');

module.exports = {
    name: 'play',
    async execute(message, args, client, player) {
        const query = args.join(' ');
        if (!query) {
            return message.reply('❌ Ketik judul lagu atau link YouTube!');
        }

        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            return message.reply('❌ Kamu harus masuk voice channel dulu.');
        }

        const guildQueue = player.nodes.get(message.guild.id);
        if (guildQueue && guildQueue.connection && guildQueue.connection.channel.id !== voiceChannel.id) {
            return message.reply('❌ Aku sudah terhubung ke voice channel lain di server ini. Silakan bergabung ke channel itu, atau putuskan koneksiku terlebih dahulu.');
        }

        const searchResult = await player.search(query, {
            requestedBy: message.author,
            searchEngine: QueryType.Youtube
        });

        if (!searchResult || !searchResult.tracks.length) {
            return message.reply('❌ Tidak ditemukan lagu di YouTube.');
        }

        const tracks = searchResult.tracks.slice(0, 5);

        const embed = new EmbedBuilder()
            .setTitle('🎶 Hasil Pencarian di YouTube')
            .setDescription(
                tracks
                    .map((t, i) => `**${i + 1}.** [${t.title}](${t.url}) \`[${t.duration}]\``)
                    .join('\n')
            )
            .setColor('Blue');

        const menu = new StringSelectMenuBuilder()
            .setCustomId('select-track')
            .setPlaceholder('Pilih lagu untuk diputar...')
            .addOptions(
                tracks.map((t, i) => ({
                    label: t.title.slice(0, 100),
                    description: `Durasi: ${t.duration}`,
                    value: i.toString()
                }))
            );

        const row = new ActionRowBuilder().addComponents(menu);

        const sentMsg = await message.reply({ embeds: [embed], components: [row] });

        const collector = sentMsg.createMessageComponentCollector({
            componentType: 3,
            time: 15000,
            filter: interaction => interaction.user.id === message.author.id
        });

        collector.on('collect', async interaction => {
            await interaction.deferUpdate();

            const idx = parseInt(interaction.values[0], 10);
            const selectedTrack = tracks[idx];

            let queue = player.nodes.get(message.guild.id);
            if (!queue) {
                queue = await player.nodes.create(message.guild, {
                    metadata: { channel: message.channel },
                    selfDeaf: true,
                    volume: 80,
                    voiceAdapterCreator: message.guild.voiceAdapterCreator
                });
            }

            try {
                if (!queue.connection) {
                    await queue.connect(voiceChannel);
                }
            } catch (err) {
                console.error("Gagal join voice channel:", err);
                player.nodes.delete(message.guild.id);
                return message.channel.send({
                    content: '❌ Gagal join voice channel! Pastikan aku punya izin.'
                });
            }

            queue.addTrack(selectedTrack);
            if (!queue.playing) {
                await queue.node.play();
            }

            return message.channel.send(`🎧 Memutar lagu: **${selectedTrack.title}**`);
        });

        collector.on('end', async (_, reason) => {
            if (reason === 'time') {
                await sentMsg.edit({
                    content: '⌛ Waktu habis. Command dibatalkan.',
                    components: [],
                    embeds: []
                });
            }
        });
    }
};