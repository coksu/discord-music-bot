// index.js

global.crypto = require("crypto")

const { Client, GatewayIntentBits, Collection, Partials } = require("discord.js")
const { Player } = require("discord-player")
const { YoutubeiExtractor } = require("discord-player-youtubei")
const fs = require("fs")
const path = require("path")
require("dotenv").config()

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
})

client.commands = new Collection()

const loadBot = async () => {
  // Load slash commands
  const commandsPath = path.join(__dirname, "commands")
  const commandFolders = fs.readdirSync(commandsPath)

  for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder)
    if (!fs.lstatSync(folderPath).isDirectory()) continue

    const commandFiles = fs.readdirSync(folderPath).filter((file) => file.endsWith(".js"))

    for (const file of commandFiles) {
      const filePath = path.join(folderPath, file)
      const command = require(filePath)

      if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command)
        console.log(`✅ Loaded command: ${command.data.name}`)
      } else {
        console.log(`⚠️ Command at ${filePath} is missing "data" or "execute" property.`)
      }
    }
  }

  // Initialize discord-player
  const player = new Player(client, {
    ytdlOptions: {
      quality: "highestaudio",
      highWaterMark: 1 << 25,
    },
  })

  // Load YouTube extractor
  try {
    await player.extractors.register(YoutubeiExtractor, {})
    console.log("✅ YouTube extractor loaded successfully")
  } catch (error) {
    console.log("⚠️ Error loading YouTube extractor:", error.message)
    // Fallback to default extractors
    try {
      await player.extractors.loadDefault()
      console.log("✅ Default extractors loaded as fallback")
    } catch (fallbackError) {
      console.log("❌ Failed to load any extractors:", fallbackError.message)
    }
  }

  client.player = player

  // Player event handlers
  player.events.on("error", (queue, error) => {
    console.error(`❌ Queue error in ${queue.guild.name}:`, error)
    if (queue.metadata && queue.metadata.channel) {
      queue.metadata.channel.send(`❌ Terjadi kesalahan: ${error.message}`)
    }
  })

  player.events.on("playerError", (queue, error) => {
    console.error(`❌ Player error in ${queue.guild.name}:`, error)
    if (queue.metadata && queue.metadata.channel) {
      queue.metadata.channel.send(`❌ Error saat memutar: ${error.message}`)
    }
  })

  player.events.on("playerStart", (queue, track) => {
    console.log(`▶️ Started playing: ${track.title}`)
    if (queue.metadata && queue.metadata.channel) {
      queue.metadata.channel.send(`▶️ Mulai memutar: **${track.title}**`)
    }
  })

  player.events.on("emptyChannel", (queue) => {
    console.log(`👋 Left empty channel in ${queue.guild.name}`)
    queue.delete()
  })

  player.events.on("emptyQueue", (queue) => {
    console.log(`📭 Queue finished in ${queue.guild.name}`)
    queue.delete()
  })

  client.once("ready", () => {
    console.log(`✅ Bot ready as ${client.user.tag}`)
    console.log(`📊 Loaded ${client.commands.size} slash commands`)
    console.log(`🎵 Discord-player version: ${require("discord-player/package.json").version}`)
  })

  // Handle slash command interactions
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return

    const command = client.commands.get(interaction.commandName)

    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`)
      return
    }

    try {
      await command.execute(interaction, client.player)
    } catch (error) {
      console.error(`Error executing ${interaction.commandName}:`, error)

      const errorMessage = "❌ Terjadi kesalahan saat menjalankan command!"

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: errorMessage, ephemeral: true })
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true })
      }
    }
  })

  client.login(process.env.TOKEN)
}

loadBot()
