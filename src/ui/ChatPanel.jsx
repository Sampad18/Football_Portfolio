import { useEffect, useRef, useState } from 'react'
import { CHAT } from '../content.js'
import { useGame } from '../store.js'
import { ask } from '../chat/ask.js'

const MAX_QUESTION = 300

// The chat with the sideline robot. Same shell as the section panels.
export function ChatPanel({ zone }) {
  const close = useGame((s) => s.close)
  const [messages, setMessages] = useState([{ role: 'bot', text: CHAT.greeting }])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const list = useRef()
  const input = useRef()

  useEffect(() => {
    // on a phone, focusing straight away would pop the keyboard over the greeting
    if (!window.matchMedia('(pointer: coarse)').matches) input.current?.focus()
  }, [])

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: 'smooth' })
  }, [messages, busy])

  const send = async (text) => {
    const question = text.trim().slice(0, MAX_QUESTION)
    if (!question || busy) return
    const history = [...messages, { role: 'user', text: question }]
    setMessages(history)
    setDraft('')
    setBusy(true)
    const answer = await ask(history)
    setMessages([...history, { role: 'bot', text: answer }])
    setBusy(false)
  }

  const asked = messages.some((m) => m.role === 'user')

  return (
    <div className="panel-backdrop" onClick={close}>
      <section
        className="panel chat"
        style={{ '--zone': zone.color }}
        role="dialog"
        aria-modal="true"
        aria-label={CHAT.title}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="chat-head">
          <button className="panel-close" onClick={close} aria-label="Close">
            ✕
          </button>
          <p className="kicker">{CHAT.kicker}</p>
          <h2>{CHAT.title}</h2>
        </header>

        <div ref={list} className="chat-list" aria-live="polite">
          {messages.map((m, i) => (
            <div key={i} className={`bubble bubble-${m.role}`}>
              {m.text}
            </div>
          ))}
          {busy && (
            <div className="bubble bubble-bot bubble-typing" aria-label="The bot is typing">
              <span />
              <span />
              <span />
            </div>
          )}
          {!asked && (
            <div className="chat-suggestions">
              {CHAT.suggestions.map((s) => (
                <button key={s} className="tag chip" onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <form
          className="chat-form"
          onSubmit={(e) => {
            e.preventDefault()
            send(draft)
          }}
        >
          <input
            ref={input}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={MAX_QUESTION}
            placeholder="Ask about Sampad…"
            aria-label="Your question"
            autoComplete="off"
            enterKeyHint="send"
          />
          <button className="btn btn-primary" type="submit" disabled={busy || !draft.trim()}>
            Send
          </button>
        </form>
        <p className="chat-note">{CHAT.note}</p>
      </section>
    </div>
  )
}
