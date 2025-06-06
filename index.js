// index.js

global.crypto = require('crypto');

const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
const { Player } = require('discord-player');
const { DefaultExtractors } = require('@discord-player/extractor');
const fs = require('fs');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel]
});

client.commands = new Collection();

const loadBot = async () => {
    const commandFolders = fs.readdirSync('./commands');
    for (const folder of commandFolders) {
        const folderPath = `./commands/${folder}`;
        if (!fs.lstatSync(folderPath).isDirectory()) continue;

        const commandFiles = fs
            .readdirSync(folderPath)
            .filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const command = require(`${folderPath}/${file}`);
            if (command.name && typeof command.execute === 'function') {
                client.commands.set(command.name, command);
            }
        }
    }

    const player = new Player(client);
    await player.extractors.loadMulti(DefaultExtractors);
    client.player = player;

    // --- Tambahkan ini untuk menangani event error discord-player ---
    player.events.on('error', (queue, error) => {
        console.error(`Error dari antrian ${queue.guild.name}:`, error);
        queue.metadata.channel.send(`Terjadi kesalahan dengan antrian musik: ${error.message}`);
    });

    player.events.on('playerError', (queue, error) => {
        console.error(`Player error dari antrian ${queue.guild.name}:`, error);
        queue.metadata.channel.send(`Terjadi kesalahan pada player: ${error.message}`);
    });

    player.events.on('audioTrackAdd', (queue, track) => {
        queue.metadata.channel.send(`🎶 **${track.title}** telah ditambahkan ke antrian.`);
    });

    player.events.on('playerStart', (queue, track) => {
        queue.metadata.channel.send(`▶️ Mulai memutar: **${track.title}**`);
    });

    player.events.on('emptyChannel', (queue) => {
        queue.metadata.channel.send('Tidak ada lagi di channel suara, aku pergi sekarang.');
        queue.delete();
    });

    player.events.on('emptyQueue', (queue) => {
        queue.metadata.channel.send('Antrian kosong, selesai memutar.');
        queue.delete();
    });
    // --- Akhir penambahan ---

    client.once('ready', () => {
        console.log(`✅ Bot aktif sebagai ${client.user.tag}`);
    });

    client.on('messageCreate', async message => {
        if (message.author.bot || !message.guild) return;
        if (!message.content.startsWith(process.env.PREFIX)) return;

        const args = message.content
            .slice(process.env.PREFIX.length)
            .trim()
            .split(/ +/);
        const cmdName = args.shift().toLowerCase();

        const command = client.commands.get(cmdName);
        if (!command) return;

        try {
            await command.execute(message, args, client, player);
        } catch (err) {
            console.error(err);
            message.reply('❌ Terjadi error saat menjalankan command.');
        }
    });

    client.login(process.env.TOKEN);
};

loadBot();