const { SlashCommandBuilder, EmbedBuilder } = require("discord.js")
const { QueryType } = require("discord-player")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("search")
    .setDescription("Mencari lagu tanpa langsung memutar")
    .addStringOption((option) =>
      option.setName("query").setDescription("Nama lagu yang ingin dicari").setRequired(true),
    ),

  async execute(interaction, player) {
    const query = interaction.options.getString("query")

    await interaction.deferReply()

    try {
      // Try multiple search engines
      let searchResult = null
      const searchEngines = [QueryType.YOUTUBE_SEARCH, QueryType.AUTO]

      for (const engine of searchEngines) {
        try {
          searchResult = await player.search(query, {
            requestedBy: interaction.user,
            searchEngine: engine,
          })

          if (searchResult && searchResult.tracks.length > 0) {
            break
          }
        } catch (engineError) {
          continue
        }
      }

      if (!searchResult || !searchResult.tracks.length) {
        return interaction.editReply("❌ Tidak ditemukan lagu dengan kata kunci tersebut.")
      }

      const tracks = searchResult.tracks.slice(0, 10)

      const embed = new EmbedBuilder()
        .setTitle(`🔍 Hasil Pencarian: "${query}"`)
        .setDescription(
          tracks
            .map((t, i) => `**${i + 1}.** [${t.title}](${t.url})\n👤 ${t.author} • ⏱️ \`${t.duration}\``)
            .join("\n\n"),
        )
        .setColor("#3498DB")
        .setFooter({ text: `Ditemukan ${tracks.length} lagu • Gunakan /play untuk memutar` })

      interaction.editReply({ embeds: [embed] })
    } catch (error) {
      console.error("Search command error:", error)
      interaction.editReply("❌ Terjadi kesalahan saat mencari lagu.")
    }
  },
}
