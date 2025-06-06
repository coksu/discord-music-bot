import { EmbedBuilder } from "discord.js"

export function createEmbed({ title, description, color = 0x3498db, thumbnail, footer, fields = [] }) {
  const embed = new EmbedBuilder().setTitle(title).setDescription(description).setColor(color)

  if (thumbnail) {
    embed.setThumbnail(thumbnail)
  }

  if (footer) {
    embed.setFooter({ text: footer })
  }

  if (fields.length > 0) {
    embed.addFields(fields)
  }

  embed.setTimestamp()

  return embed
}
