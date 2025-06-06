const { SlashCommandBuilder, EmbedBuilder } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder().setName("skip").setDescription("Melewati lagu yang sedang diputar"),

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

    const currentTrack = queue.currentTrack
    const success = await queue.node.skip()

    if (success) {
      const embed = new EmbedBuilder()
        .setColor("#FFE66D")
        .setTitle("⏭️ Lagu Di-skip")
        .setDescription(`**${currentTrack.title}** telah di-skip`)
        .setThumbnail(currentTrack.thumbnail)
        .setFooter({ text: `Di-skip oleh ${interaction.user.tag}` })

      interaction.reply({ embeds: [embed] })
    } else {
      interaction.reply({
        content: "❌ Tidak ada lagu berikutnya dalam antrian untuk di-skip.",
        ephemeral: true,
      })
    }
  },
}
