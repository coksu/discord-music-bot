const { SlashCommandBuilder, EmbedBuilder } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("volume")
    .setDescription("Mengatur atau melihat volume musik")
    .addIntegerOption((option) =>
      option.setName("level").setDescription("Level volume (0-100)").setMinValue(0).setMaxValue(100).setRequired(false),
    ),

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

    const vol = interaction.options.getInteger("level")

    if (vol === null) {
      const embed = new EmbedBuilder()
        .setColor("#3498DB")
        .setTitle("🔊 Volume Saat Ini")
        .setDescription(`Volume: **${queue.node.volume}%**\n\nGunakan: \`/volume level:<0-100>\``)
        .setFooter({ text: "Contoh: /volume level:50" })

      return interaction.reply({ embeds: [embed] })
    }

    queue.node.setVolume(vol)

    const embed = new EmbedBuilder()
      .setColor("#2ECC71")
      .setTitle("🔊 Volume Diubah")
      .setDescription(`Volume diatur ke **${vol}%**`)
      .setFooter({ text: `Diubah oleh ${interaction.user.tag}` })

    interaction.reply({ embeds: [embed] })
  },
}
