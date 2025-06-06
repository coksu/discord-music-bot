const { SlashCommandBuilder, EmbedBuilder } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("nowplaying")
    .setDescription("Menampilkan informasi lagu yang sedang diputar"),

  async execute(interaction, player) {
    const queue = player.nodes.get(interaction.guild.id)

    if (!queue || !queue.currentTrack) {
      return interaction.reply({
        content: "❌ Tidak ada lagu yang sedang diputar saat ini.",
        ephemeral: true,
      })
    }

    const track = queue.currentTrack
    const progress = queue.node.createProgressBar()

    const embed = new EmbedBuilder()
      .setColor("#E74C3C")
      .setTitle("🎧 Sedang Diputar")
      .setDescription(`**[${track.title}](${track.url})**\n👤 **${track.author}**\n\n${progress}`)
      .setThumbnail(track.thumbnail)
      .addFields(
        { name: "⏱️ Durasi", value: `\`${track.duration}\``, inline: true },
        { name: "🔊 Volume", value: `\`${queue.node.volume}%\``, inline: true },
        { name: "🔁 Loop", value: queue.repeatMode ? "✅ Aktif" : "❌ Tidak aktif", inline: true },
        { name: "👤 Diminta oleh", value: `${track.requestedBy.tag}`, inline: true },
        { name: "📍 Sumber", value: track.source, inline: true },
        { name: "👥 Listeners", value: `${queue.connection.channel.members.size - 1}`, inline: true },
      )
      .setFooter({ text: `Antrian: ${queue.tracks.size} lagu` })

    interaction.reply({ embeds: [embed] })
  },
}
