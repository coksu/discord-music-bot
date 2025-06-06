const { SlashCommandBuilder, EmbedBuilder } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder().setName("pause").setDescription("Menjeda musik yang sedang diputar"),

  async execute(interaction, player) {
    // Check if user is in voice channel
    if (!interaction.member.voice.channel) {
      return interaction.reply({
        content: "❌ Kamu harus masuk voice channel dulu!",
        ephemeral: true,
      })
    }

    const queue = player.nodes.get(interaction.guild.id)

    if (!queue || !queue.connection || !queue.node.isPlaying()) {
      return interaction.reply({
        content: "❌ Tidak ada lagu yang sedang diputar.",
        ephemeral: true,
      })
    }

    if (queue.node.isPaused()) {
      return interaction.reply({
        content: "❌ Lagu sudah dalam keadaan dijeda.",
        ephemeral: true,
      })
    }

    queue.node.pause()

    const embed = new EmbedBuilder()
      .setColor("#FFE66D")
      .setTitle("⏸️ Musik Dijeda")
      .setDescription(`**${queue.currentTrack.title}** dijeda`)
      .setThumbnail(queue.currentTrack.thumbnail)
      .setFooter({ text: `Dijeda oleh ${interaction.user.tag}` })

    interaction.reply({ embeds: [embed] })
  },
}
