import { useRef, useState, useSyncExternalStore } from 'react'
import { href } from '../hooks/useHashRoute.js'
import { MESSAGE_MAX, SENDER_MAX } from '../lib/text.js'

const noSubscribe = () => () => {}
const clipboardReadable = () => typeof navigator.clipboard?.readText === 'function'
// Prerendered HTML includes the paste button, so the layout doesn't jump on
// load; the rare browser that can't read the clipboard hides it afterwards.
const assumeReadable = () => true

const PASTE_NOTES = {
  denied: 'فون نے اجازت نہیں دی۔ خالی خانے پر انگلی دبا کر رکھیں اور «پیسٹ» دبائیں۔',
  empty: 'ابھی کوئی میسج کاپی نہیں ہوا۔ پہلے میسج پر انگلی دبا کر رکھیں اور «کاپی» دبائیں۔',
}

export default function CheckScreen({ draft, onChange, onCheck }) {
  const [error, setError] = useState('')
  const [pasteNote, setPasteNote] = useState('')
  const messageRef = useRef(null)
  const canReadClipboard = useSyncExternalStore(noSubscribe, clipboardReadable, assumeReadable)

  function update(field, value) {
    onChange({ ...draft, [field]: value })
    if (field === 'text' && value.trim()) setError('')
  }

  async function paste() {
    setPasteNote('')
    try {
      const text = (await navigator.clipboard.readText()).slice(0, MESSAGE_MAX)
      if (!text.trim()) {
        setPasteNote(PASTE_NOTES.empty)
        return
      }
      update('text', text)
    } catch {
      setPasteNote(PASTE_NOTES.denied)
    }
    messageRef.current?.focus()
  }

  function submit(event) {
    event.preventDefault()
    if (!draft.text.trim()) {
      setError('پہلے میسج اس خانے میں ڈالیں، پھر بٹن دبائیں۔')
      messageRef.current?.focus()
      return
    }
    onCheck()
  }

  return (
    <>
      <header className="app-header">
        <img className="app-logo" src="./favicon.svg" alt="" width="52" height="52" />
        <h1 className="app-title" tabIndex={-1}>
          فراڈ میسج چیکر
        </h1>
      </header>

      <form className="check-form" onSubmit={submit} noValidate>
        <div className="field">
          <label className="field-label" htmlFor="message">
            مشکوک میسج یہاں ڈالیں
          </label>
          <textarea
            id="message"
            ref={messageRef}
            className="message-box"
            dir="auto"
            rows={3}
            maxLength={MESSAGE_MAX}
            placeholder="یہاں انگلی دبا کر رکھیں اور «پیسٹ» دبائیں"
            value={draft.text}
            onChange={(e) => update('text', e.target.value)}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? 'message-error' : undefined}
          />
          {error && (
            <p id="message-error" className="field-error" role="alert">
              {error}
            </p>
          )}
          {canReadClipboard && (
            <button type="button" className="btn btn-quiet" onClick={paste}>
              <svg className="btn-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M9 4h6v3H9zM7 5H5v16h14V5h-2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
              میسج پیسٹ کریں
            </button>
          )}
          {pasteNote && (
            <p className="field-note" role="status">
              {pasteNote}
            </p>
          )}
        </div>

        <div className="field">
          <label className="field-label field-label-sm" htmlFor="sender">
            کس نمبر سے آیا؟ <span className="optional">(اگر معلوم ہو)</span>
          </label>
          <input
            id="sender"
            className="sender-box"
            dir="ltr"
            inputMode="tel"
            autoComplete="off"
            maxLength={SENDER_MAX}
            placeholder="8171 / 0300 1234567"
            value={draft.sender}
            onChange={(e) => update('sender', e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-check">
          میسج چیک کریں
        </button>
      </form>

      <nav className="footer-links" aria-label="مزید معلومات">
        <a href={href('help')}>یہ کیسے کام کرتا ہے؟</a>
        <a href={href('privacy')}>آپ کا ڈیٹا</a>
      </nav>
    </>
  )
}
