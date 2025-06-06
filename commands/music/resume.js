const { SlashCommandBuilder, EmbedBuilder } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder().setName("resume").setDescription("Melanjutkan musik yang dijeda"),

  async execute(interaction, player) {
    // Check if user is in voice channel
    if (!interaction.member.voice.channel) {
      return interaction.reply({
        content: "❌ Kamu harus masuk voice channel dulu!",
        ephemeral: true,
      })
    }

    const queue = player.nodes.get(interaction.guild.id)

    if (!queue || !queue.connection) {
      return interaction.reply({
        content: "❌ Tidak ada lagu yang dijeda.",
        ephemeral: true,
      })
    }

    if (!queue.node.isPaused()) {
      return interaction.reply({
        content: "❌ Lagu tidak dalam keadaan dijeda.",
        ephemeral: true,
      })
    }

    queue.node.resume()

    const embed = new EmbedBuilder()
      .setColor("#4ECDC4")
      .setTitle("▶️ Musik Dilanjutkan")
      .setDescription(`**${queue.currentTrack.title}** dilanjutkan`)
      .setThumbnail(queue.currentTrack.thumbnail)
      .setFooter({ text: `Dilanjutkan oleh ${interaction.user.tag}` })

    interaction.reply({ embeds: [embed] })
  },
}
