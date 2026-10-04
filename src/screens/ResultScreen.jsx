import SpeakButton from '../components/SpeakButton.jsx'
import { alertMessage, shareUrl } from '../lib/whatsapp.js'

function appUrl() {
  return `${window.location.origin}${window.location.pathname}`
}

function Mark({ verdict }) {
  return (
    <svg className="verdict-mark" viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="60" cy="60" r="56" className="mark-disc" />
      {verdict === 'scam' ? (
        <path d="M40 40l40 40M80 40L40 80" className="mark-line" />
      ) : (
        <path d="M36 62l16 16 32-36" className="mark-line" />
      )}
    </svg>
  )
}

export default function ResultScreen({ result, online, onAgain }) {
  const scam = result.verdict === 'scam'

  return (
    <div className="result-inner">
      <Mark verdict={result.verdict} />
      <h1 className="verdict" tabIndex={-1}>
        {scam ? '🚨 یہ جھوٹا اور فراڈ میسج ہے!' : '✅ یہ میسج محفوظ لگتا ہے۔'}
      </h1>
      <p className="verdict-advice">
        {scam
          ? 'اس نمبر پر واپس کال مت کریں اور نہ ہی کوئی کوڈ بتائیں۔'
          : 'اس میں فراڈ کی کوئی عام نشانی نہیں ملی۔ پھر بھی کسی کو اپنا کوڈ یا پن مت بتائیں۔'}
      </p>

      <SpeakButton verdict={result.verdict} online={online} />

      {scam && (
        <>
          <a
            className="btn btn-wa"
            href={shareUrl(alertMessage(result.text, appUrl()))}
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg className="btn-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z"
              />
            </svg>
            فیملی کو واٹس ایپ پر الرٹ کریں
          </a>
          {!online && <p className="result-note">انٹرنیٹ آنے پر واٹس ایپ پیغام چلا جائے گا۔</p>}

          <section className="reasons" aria-labelledby="reasons-title">
            <h2 id="reasons-title" className="reasons-title">
              یہ نشانیاں ملیں
            </h2>
            <ul>
              {result.reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </section>
        </>
      )}

      <button type="button" className="btn btn-again" onClick={onAgain}>
        دوسرا میسج چیک کریں
      </button>
    </div>
  )
}
