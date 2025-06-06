const { SlashCommandBuilder, EmbedBuilder } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder().setName("queue").setDescription("Menampilkan antrian musik"),

  async execute(interaction, player) {
    const queue = player.nodes.get(interaction.guild.id)

    if (!queue || (!queue.currentTrack && queue.tracks.size === 0)) {
      return interaction.reply({
        content: "❌ Antrian lagu kosong.",
        ephemeral: true,
      })
    }

    const currentTrack = queue.currentTrack
    const tracks = queue.tracks.toArray()

    const embed = new EmbedBuilder().setTitle("🎶 Antrian Musik").setColor("#9B59B6")

    let description = ""

    if (currentTrack) {
      description += `**🎵 Sedang Diputar:**\n[${currentTrack.title}](${currentTrack.url}) \`[${currentTrack.duration}]\`\n👤 ${currentTrack.author}\n\n`
    }

    if (tracks.length > 0) {
      description += `**📜 Selanjutnya dalam Antrian:**\n`
      description += tracks
        .slice(0, 10)
        .map((track, i) => `**${i + 1}.** [${track.title}](${track.url}) \`[${track.duration}]\`\n👤 ${track.author}`)
        .join("\n\n")

      if (tracks.length > 10) {
        description += `\n\n*...dan ${tracks.length - 10} lagu lainnya.*`
      }
    } else if (!currentTrack) {
      description += `Antrian kosong.`
    }

    embed.setDescription(description)
    embed.setFooter({ text: `Total lagu dalam antrian: ${tracks.length}` })

    interaction.reply({ embeds: [embed] })
  },
}
