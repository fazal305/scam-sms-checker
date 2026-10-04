// The spoken warnings. Many phones have no Urdu voice but do have a Hindi one,
// and spoken Hindi and Urdu are the same for sentences this simple, so each
// line is also written in Devanagari for that voice to read.
export const LINES = {
  scam: {
    ur: 'یہ میسج بالکل جھوٹا ہے، اس نمبر پر واپس کال مت کریں اور نہ ہی کوئی کوڈ بتائیں۔',
    hi: 'यह मैसेज बिल्कुल झूठा है, इस नंबर पर वापस कॉल मत करें और न ही कोई कोड बताएं।',
  },
  safe: {
    ur: 'یہ میسج محفوظ لگتا ہے۔ پھر بھی کسی کو اپنا کوڈ یا پن مت بتائیں۔',
    hi: 'यह मैसेज महफ़ूज़ लगता है। फिर भी किसी को अपना कोड या पिन मत बताएं।',
  },
}

const langOf = (voice) => voice.lang.toLowerCase().replace('_', '-')

// Offline, only voices installed on the phone can speak.
export function pickVoice(voices, online = true) {
  const usable = online ? voices : voices.filter((v) => v.localService)
  const ranked = (prefix) =>
    usable.filter((v) => langOf(v).startsWith(prefix)).sort((a, b) => Number(b.localService) - Number(a.localService))
  const ur = ranked('ur')[0]
  if (ur) return { voice: ur, lang: 'ur' }
  const hi = ranked('hi')[0]
  if (hi) return { voice: hi, lang: 'hi' }
  return null
}

export function speechSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
}

// Browsers fill the voice list asynchronously; the first call often sees [].
export function loadVoices(timeout = 1500) {
  const synth = window.speechSynthesis
  const now = synth.getVoices()
  if (now.length > 0) return Promise.resolve(now)
  return new Promise((resolve) => {
    const done = () => {
      synth.removeEventListener('voiceschanged', done)
      clearTimeout(timer)
      resolve(synth.getVoices())
    }
    const timer = setTimeout(done, timeout)
    synth.addEventListener('voiceschanged', done)
  })
}
