import { localAnswer } from './localAnswer.js'

// Once we learn there is no AI backend (local dev, or no API key on Vercel), stop asking it.
let backendMissing = false

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// history: [{ role: 'user' | 'bot', text }], ending with the visitor's question.
export async function ask(history) {
  const question = history[history.length - 1].text

  if (!backendMissing) {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          messages: history.slice(-8).map((m) => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.text })),
        }),
        signal: AbortSignal.timeout(25000),
      })
      if (response.ok) {
        const data = await response.json()
        if (data.answer) return data.answer
      } else if (response.status === 429) {
        return "I'm getting a lot of questions right now. Give me a minute, then ask again."
      } else if (response.status === 404 || response.status === 405 || response.status === 503) {
        backendMissing = true
      }
    } catch {
      // network problem or a non-JSON reply: fall through to the built-in answers
    }
  }

  await wait(450) // a short pause so the reply doesn't feel instant and robotic
  return localAnswer(question)
}
