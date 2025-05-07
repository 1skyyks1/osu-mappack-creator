import fs from 'fs'

export function parseOsuFile(content) {
  const sections = {}
  let currentSection = null

  content.split('\n').forEach((line) => {
    line = line.trim()
    if (!line) return

    if (line.startsWith('[') && line.endsWith(']')) {
      currentSection = line.slice(1, -1)
      sections[currentSection] = []
    } else if (currentSection) {
      if (['General', 'Metadata'].includes(currentSection)) {
        const [key, ...values] = line.split(':')
        sections[currentSection][key.trim()] = values.join(':').trim()
      } else {
        sections[currentSection].push(line)
      }
    }
  })

  return sections
}

export function updateOsuFile(content, { options, beatmap, overrides }) {
  if (overrides?.audio) {
    content = content.replace(/^AudioFilename:.*$/m, `AudioFilename: ${overrides.audio}`)
  }
  if (overrides?.image) {
    content = content.replace(/^0,0,"([^"]+)",\d+,\d+$/m, `0,0,"${overrides.image}",0,0`)
  }
  return content
    .replace(/Title:[^\n]+/, `Title:${options.mapsetName}`)
    .replace(/TitleUnicode:[^\n]+/, `TitleUnicode:${options.mapsetName}`)
    .replace(/Artist:[^\n]+/, `Artist:${options.artistName}`)
    .replace(/ArtistUnicode:[^\n]+/, `ArtistUnicode:${options.artistName}`)
    .replace(/Creator:[^\n]+/, `Creator:${options.mapsetCreator}`)
    .replace(/HPDrainRate:[^\n]+/, `HPDrainRate:${options.hp}`)
    .replace(/OverallDifficulty:[^\n]+/, `OverallDifficulty:${options.od}`)
    .replace(/Source:[^\n]+/, `Source:`)
    .replace(/Tags:[^\n]+/, `Tags:`)
    .replace(
      /^Version:.*$/m,
      `Version: ${beatmap.metadata.artist} - ${beatmap.metadata.title} [${beatmap.metadata.version}]`
    )
    .replace(/BeatmapID:[^\n]+/, 'BeatmapID:0')
    .replace(/BeatmapSetID:[^\n]+/, 'BeatmapSetID:-1')
}
