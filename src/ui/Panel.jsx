import { useEffect, useRef } from 'react'
import { PROFILE } from '../content.js'
import { useGame } from '../store.js'

function Item({ item }) {
  return (
    <article className="item">
      <header>
        <h3>{item.title}</h3>
        <p className="item-org">
          {item.org}
          {item.meta ? <span> · {item.meta}</span> : null}
        </p>
      </header>
      {item.points?.length > 0 && (
        <ul>
          {item.points.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      )}
      {item.link && (
        <a className="link" href={item.link.href} target="_blank" rel="noreferrer">
          {item.link.label} ↗
        </a>
      )}
    </article>
  )
}

export function Panel({ zone, data }) {
  const close = useGame((s) => s.close)
  const closeBtn = useRef()

  useEffect(() => {
    closeBtn.current?.focus()
  }, [zone.id])

  return (
    <div className="panel-backdrop" onClick={close}>
      <section
        className="panel"
        style={{ '--zone': zone.color }}
        role="dialog"
        aria-modal="true"
        aria-label={data.title}
        onClick={(e) => e.stopPropagation()}
      >
        <button ref={closeBtn} className="panel-close" onClick={close} aria-label="Close">
          ✕
        </button>
        <p className="kicker">{data.kicker}</p>
        <h2>{data.title}</h2>

        {data.intro && <p className="lead">{data.intro}</p>}

        {data.stats && (
          <div className="stats">
            {data.stats.map((s) => (
              <div key={s.value} className="stat">
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {data.body?.map((p) => (
          <p key={p}>{p}</p>
        ))}

        {data.items?.map((item) => (
          <Item key={item.title} item={item} />
        ))}

        {data.groups?.map((g) => (
          <div key={g.name} className="group">
            <h3>{g.name}</h3>
            <div className="tags">
              {g.tags.map((t) => (
                <span key={t} className="tag">
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}

        {data.contact && (
          <div className="contact">
            <a className="btn btn-primary" href={`mailto:${PROFILE.email}`}>
              {PROFILE.email}
            </a>
            <a className="btn" href={PROFILE.linkedin} target="_blank" rel="noreferrer">
              LinkedIn ↗
            </a>
            <a className="btn btn-cv" href={import.meta.env.BASE_URL + PROFILE.cv} download="Sampad-Patra-CV.pdf">
              ↓ Download CV (PDF)
            </a>
            <p className="muted">{PROFILE.location}</p>
          </div>
        )}

        <p className="panel-foot">
          <kbd>Esc</kbd> back to the pitch
        </p>
      </section>
    </div>
  )
}
