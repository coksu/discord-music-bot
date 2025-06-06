const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require("discord.js")
const { QueryType } = require("discord-player")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Memutar musik dari YouTube")
    .addStringOption((option) =>
      option.setName("query").setDescription("Nama lagu atau URL YouTube yang ingin diputar").setRequired(true),
    ),

  async execute(interaction, player) {
    const query = interaction.options.getString("query")

    // Check if user is in voice channel
    if (!interaction.member?.voice?.channel) {
      return interaction.reply({
        content: "❌ Kamu harus masuk voice channel dulu!",
        flags: 64, // ephemeral flag
      })
    }

    const voiceChannel = interaction.member.voice.channel
    const guildQueue = player.nodes.get(interaction.guild?.id)

    // Check if bot is already in different voice channel
    if (guildQueue && guildQueue.connection && guildQueue.connection.channel.id !== voiceChannel.id) {
      return interaction.reply({
        content: "❌ Aku sudah terhubung ke voice channel lain di server ini. Gunakan `/stop` terlebih dahulu.",
        flags: 64, // ephemeral flag
      })
    }

    await interaction.deferReply()

    try {
      console.log(`🔍 Searching for: "${query}"`)

      // Search using discord-player
      const searchResult = await player.search(query, {
        requestedBy: interaction.user,
        searchEngine: QueryType.AUTO,
      })

      console.log(`📊 Search result:`, {
        hasResult: !!searchResult,
        tracksCount: searchResult?.tracks?.length || 0,
        playlist: !!searchResult?.playlist,
      })

      if (!searchResult || !searchResult.tracks || searchResult.tracks.length === 0) {
        const errorEmbed = new EmbedBuilder()
          .setColor("#FF6B6B")
          .setTitle("❌ Tidak Ditemukan")
          .setDescription(
            `Tidak dapat menemukan lagu: **${query}**\n\n` +
              "**Coba:**\n" +
              "• Gunakan kata kunci yang lebih sederhana\n" +
              "• Contoh: `faded`, `believer`, `shape of you`\n" +
              "• Atau gunakan link YouTube langsung",
          )
          .setFooter({ text: "Tips: Coba kata kunci dalam bahasa Inggris" })

        return interaction.editReply({ embeds: [errorEmbed] })
      }

      // If it's a playlist, add all tracks
      if (searchResult.playlist) {
        let queue = player.nodes.get(interaction.guild.id)
        if (!queue) {
          queue = await player.nodes.create(interaction.guild, {
            metadata: { channel: interaction.channel },
            selfDeaf: true,
            volume: 80,
            voiceAdapterCreator: interaction.guild.voiceAdapterCreator,
          })
        }

        try {
          if (!queue.connection) {
            await queue.connect(voiceChannel)
          }
        } catch (err) {
          console.error("❌ Failed to join voice channel:", err)
          player.nodes.delete(interaction.guild.id)
          return interaction.editReply("❌ Gagal join voice channel! Pastikan aku punya izin Connect dan Speak.")
        }

        // Add all tracks from playlist
        queue.addTrack(searchResult.tracks)

        if (!queue.playing) {
          await queue.node.play()
        }

        const embed = new EmbedBuilder()
          .setColor("#4ECDC4")
          .setTitle("✅ Playlist Ditambahkan")
          .setDescription(`**${searchResult.tracks.length} lagu** dari playlist ditambahkan ke antrian`)
          .addFields({ name: "📜 Playlist", value: searchResult.playlist.title, inline: true })
          .setThumbnail(searchResult.playlist.thumbnail)
          .setFooter({ text: `Diminta oleh ${interaction.user.tag}` })

        return interaction.editReply({ embeds: [embed] })
      }

      // Multiple tracks found - show selection menu
      const tracks = searchResult.tracks.slice(0, 5)

      const embed = new EmbedBuilder()
        .setTitle("🎶 Pilih Lagu")
        .setDescription(
          tracks
            .map((t, i) => `**${i + 1}.** [${t.title}](${t.url})\n👤 ${t.author} • ⏱️ \`${t.duration}\``)
            .join("\n\n"),
        )
        .setColor("#4ECDC4")
        .setFooter({ text: "Pilih dalam 30 detik" })

      const menu = new StringSelectMenuBuilder()
        .setCustomId("select-track")
        .setPlaceholder("🎵 Pilih lagu...")
        .addOptions(
          tracks.map((t, i) => ({
            label: t.title.length > 100 ? t.title.slice(0, 97) + "..." : t.title,
            description: `${t.author} • ${t.duration}`,
            value: i.toString(),
            emoji: "🎵",
          })),
        )

      const row = new ActionRowBuilder().addComponents(menu)
      await interaction.editReply({ embeds: [embed], components: [row] })

      const collector = interaction.channel.createMessageComponentCollector({
        componentType: 3,
        time: 30000,
        filter: (i) => i.user.id === interaction.user.id,
      })

      collector.on("collect", async (i) => {
        await i.deferUpdate()

        const idx = Number.parseInt(i.values[0], 10)
        const selectedTrack = tracks[idx]

        let queue = player.nodes.get(interaction.guild.id)
        if (!queue) {
          queue = await player.nodes.create(interaction.guild, {
            metadata: { channel: interaction.channel },
            selfDeaf: true,
            volume: 80,
            voiceAdapterCreator: interaction.guild.voiceAdapterCreator,
          })
        }

        try {
          if (!queue.connection) {
            await queue.connect(voiceChannel)
          }
        } catch (err) {
          console.error("❌ Failed to join voice channel:", err)
          player.nodes.delete(interaction.guild.id)
          return interaction.editReply({
            content: "❌ Gagal join voice channel! Pastikan aku punya izin.",
            components: [],
            embeds: [],
          })
        }

        // Add track to queue
        queue.addTrack(selectedTrack)

        const successEmbed = new EmbedBuilder()
          .setColor("#4ECDC4")
          .setTitle(queue.playing ? "✅ Ditambahkan ke Antrian" : "🎵 Sekarang Memutar")
          .setDescription(`**[${selectedTrack.title}](${selectedTrack.url})**`)
          .addFields(
            { name: "👤 Artist", value: selectedTrack.author, inline: true },
            { name: "⏱️ Durasi", value: selectedTrack.duration, inline: true },
            { name: "📍 Posisi", value: queue.playing ? `${queue.tracks.size}` : "Sekarang", inline: true },
          )
          .setThumbnail(selectedTrack.thumbnail)
          .setFooter({ text: `Diminta oleh ${interaction.user.tag}` })

        // Start playing if not already playing
        if (!queue.playing) {
          try {
            await queue.node.play()
          } catch (playError) {
            console.error("❌ Error starting playback:", playError)
            return interaction.editReply({
              content: "❌ Gagal memutar lagu. Coba lagi nanti.",
              components: [],
              embeds: [],
            })
          }
        }

        return interaction.editReply({ embeds: [successEmbed], components: [] })
      })

      collector.on("end", async (_, reason) => {
        if (reason === "time") {
          await interaction.editReply({
            content: "⌛ Waktu habis. Command dibatalkan.",
            components: [],
            embeds: [],
          })
        }
      })
    } catch (error) {
      console.error("❌ Play command error:", error)

      const errorEmbed = new EmbedBuilder()
        .setColor("#FF6B6B")
        .setTitle("❌ Error")
        .setDescription(
          `Terjadi kesalahan saat mencari lagu.\n\n**Error:** ${error.message}\n\nCoba lagi dengan kata kunci yang berbeda.`,
        )

      interaction.editReply({ embeds: [errorEmbed] })
    }
  },
}
