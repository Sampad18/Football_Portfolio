// Built-in answer engine. It needs no server: it matches the question against the
// "Keywords:" lines in knowledge/about-sampad.md and returns that section's text.
// Used when the DeepSeek backend (api/chat.js) is not set up or cannot be reached.
import notes from '../../knowledge/about-sampad.md?raw'

export const NOT_IN_NOTES =
  "That's not in my notes, so I can't answer it. I only know what Sampad has told me about himself. Try asking about his work, projects, skills, education or football."

const STOP = new Set(
  'a an the is are was were be been am do does did has have had he his him she her it its i me my you your we our they them their of in on at to for from with by and or but if so as that this these those there here what which when how why can could would should will shall may might please tell give show know any some about sampad sampads patra s t'.split(
    ' ',
  ),
)

const normalise = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9+.#£ ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const stem = (word) => (word.length > 3 && word.endsWith('s') && !word.endsWith('ss') ? word.slice(0, -1) : word)

const words = (text) =>
  normalise(text)
    .split(' ')
    .map((w) => w.replace(/^[.]+|[.]+$/g, ''))
    .filter((w) => w && !STOP.has(w))
    .map(stem)

const sections = notes
  .replace(/<!--[\s\S]*?-->/g, '')
  .split(/^## /m)
  .slice(1)
  .map((chunk) => {
    const lines = chunk.split('\n')
    const title = lines[0].trim()
    const keywordLine = lines.find((l) => /^keywords:/i.test(l)) || ''
    const keywords = keywordLine
      .replace(/^keywords:/i, '')
      .split(',')
      .map((k) => normalise(k))
      .filter(Boolean)
    const answer = lines
      .slice(1)
      .filter((l) => !/^keywords:/i.test(l))
      .join('\n')
      .trim()
      .replace(/\n{2,}/g, '\n\n')
    return {
      title,
      answer,
      phrases: keywords.filter((k) => k.includes(' ')),
      singles: new Set(keywords.filter((k) => !k.includes(' ')).map(stem)),
      titleWords: new Set(words(title)),
    }
  })
  .filter((s) => s.answer)

export function localAnswer(question) {
  const text = ` ${normalise(question)} `
  const tokens = words(question)

  if (/^ (hi|hello|hey|hiya|yo|good (morning|afternoon|evening))\b/.test(text) && tokens.length <= 2) {
    return "Hello! I'm Sampad's sideline bot. Ask me about his work, projects, skills, education or football."
  }
  if (/\b(thanks|thank you|cheers)\b/.test(text) && tokens.length <= 3) {
    return 'Anytime! Ask me anything else about Sampad.'
  }

  // "tell me about Sampad" has no topic word left once common words are removed: give the introduction
  if (tokens.length === 0 && /\b(sampad|him|he|himself)\b/.test(text) && sections.length) return sections[0].answer

  let best = null
  let bestScore = 0
  for (const section of sections) {
    let score = 0
    for (const phrase of section.phrases) if (text.includes(` ${phrase} `)) score += 4
    for (const token of tokens) {
      if (section.singles.has(token)) score += 3
      else if (section.titleWords.has(token)) score += 2
    }
    if (score > bestScore) {
      bestScore = score
      best = section
    }
  }
  return best && bestScore >= 3 ? best.answer : NOT_IN_NOTES
}
