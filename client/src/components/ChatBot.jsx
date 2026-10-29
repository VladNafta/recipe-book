import { useEffect, useRef, useState } from 'react'
import { api } from '../api.js'
import { useStorage } from '../useStorage.js'

const HINTS = ['Що приготувати з картоплі?', 'Порадь швидкий десерт', 'Чим замінити вершки?']

// Чат-помічник: питання надсилаються на сервер, а той звертається до мовної моделі
export default function ChatBot({ recipes, onPick }) {
  const [open, setOpen] = useState(false)
  // історія розмови живе до закриття вкладки
  const [messages, setMessages] = useStorage('chat', [], sessionStorage)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const listRef = useRef(null)

  // прокрутка до останнього повідомлення
  useEffect(() => {
    listRef.current?.scrollTo(0, listRef.current.scrollHeight)
  }, [messages, loading, open])

  async function send(question) {
    const message = question.trim()
    if (!message || loading) return
    const history = messages.filter((m) => !m.error).slice(-10).map(({ role, text }) => ({ role, text }))
    const withQuestion = [...messages, { role: 'user', text: message }]
    setMessages(withQuestion)
    setText('')
    setLoading(true)
    try {
      const data = await api('POST', '/ai/chat', { message, history })
      setMessages([...withQuestion, { role: 'model', text: data.reply, recipeIds: data.recipeIds }])
    } catch (err) {
      const reason = err.errors?.[0]?.message ?? err.error ?? 'Немає зв\'язку з сервером'
      setMessages([...withQuestion, { role: 'model', text: reason, error: true }])
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return <button className="chat-toggle" onClick={() => setOpen(true)}>💬 Помічник</button>
  }

  return (
    <section className="chat">
      <div className="chat-head">
        <b>Кулінарний помічник</b>
        <div>
          <button className="link" onClick={() => setMessages([])}>Очистити</button>
          <button className="close" onClick={() => setOpen(false)} title="Згорнути">✕</button>
        </div>
      </div>

      <div className="chat-list" ref={listRef}>
        {messages.length === 0 && (
          <div className="chat-hints">
            <p>Запитайте, що приготувати, або оберіть підказку:</p>
            {HINTS.map((h) => <button key={h} onClick={() => send(h)}>{h}</button>)}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={'msg ' + m.role + (m.error ? ' error' : '')}>
            <p>{m.text}</p>
            {m.recipeIds?.length > 0 && (
              <div className="msg-recipes">
                {m.recipeIds.map((id) => recipes.find((r) => r.id === id)).filter(Boolean).map((r) => (
                  <button key={r.id} onClick={() => onPick(r)}>📖 {r.title}</button>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && <div className="msg model typing">Помічник думає…</div>}
      </div>

      <form className="chat-form" onSubmit={(e) => { e.preventDefault(); send(text) }}>
        <input value={text} onChange={(e) => setText(e.target.value)} maxLength={500}
          placeholder="Ваше питання…" />
        <button disabled={loading || !text.trim()}>Надіслати</button>
      </form>
    </section>
  )
}
