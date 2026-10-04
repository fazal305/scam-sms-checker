import { useEffect, useRef, useState } from 'react'
import { LINES, loadVoices, pickVoice, speechSupported } from '../lib/speech.js'

const MESSAGES = {
  unavailable: 'اس فون میں اردو یا ہندی آواز موجود نہیں، اس لیے یہ جواب سنایا نہیں جا سکتا۔ اوپر لکھا جواب کسی سے پڑھوا لیں۔',
  error: 'آواز نہیں چل سکی۔ فون کی آواز (والیوم) دیکھ کر دوبارہ بٹن دبائیں۔',
}

export default function SpeakButton({ verdict, online }) {
  const [status, setStatus] = useState('idle')
  const utterance = useRef(null)

  useEffect(() => () => utterance.current && window.speechSynthesis.cancel(), [])

  async function speak() {
    if (status === 'speaking') {
      window.speechSynthesis.cancel()
      setStatus('idle')
      return
    }
    if (!speechSupported()) {
      setStatus('unavailable')
      return
    }
    const choice = pickVoice(await loadVoices(), online)
    if (!choice) {
      setStatus('unavailable')
      return
    }
    const u = new SpeechSynthesisUtterance(LINES[verdict][choice.lang])
    u.voice = choice.voice
    u.lang = choice.voice.lang
    u.rate = 0.85
    u.onend = () => setStatus('idle')
    u.onerror = (event) => {
      if (event.error === 'interrupted' || event.error === 'canceled') return
      setStatus('error')
    }
    utterance.current = u
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(u)
    setStatus('speaking')
  }

  const speaking = status === 'speaking'
  return (
    <div className="speak">
      <button type="button" className="btn btn-speak" onClick={speak} aria-pressed={speaking}>
        <svg className="btn-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
          {speaking ? (
            <path d="M16 9l5 5m0-5l-5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          ) : (
            <path
              d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
          )}
        </svg>
        {speaking ? 'آواز بند کریں' : 'آواز میں سنیں'}
      </button>
      {MESSAGES[status] && (
        <p className="speak-note" role="alert">
          {MESSAGES[status]}
        </p>
      )}
    </div>
  )
}
