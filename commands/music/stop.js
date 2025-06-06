const { SlashCommandBuilder, EmbedBuilder } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder().setName("stop").setDescription("Menghentikan musik dan keluar dari voice channel"),

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
        content: "❌ Tidak ada yang sedang diputar.",
        ephemeral: true,
      })
    }

    const embed = new EmbedBuilder()
      .setColor("#FF6B6B")
      .setTitle("🛑 Musik Dihentikan")
      .setDescription("Semua lagu dihentikan dan bot keluar dari voice channel.")
      .setFooter({ text: `Dihentikan oleh ${interaction.user.tag}` })

    queue.delete()
    interaction.reply({ embeds: [embed] })
  },
}
