import { URL_LIKE } from './detect.js'

const EXCERPT_MAX = 300
const TRAILING = /[.,;:!?)\]}»"'۔،]+$/u

// Links in the quoted scam must not be tappable inside the family group.
export function defangLinks(text) {
  return String(text).replace(URL_LIKE, (match) => {
    const tail = match.match(TRAILING)?.[0] ?? ''
    const link = match.slice(0, match.length - tail.length)
    const [host, ...rest] = link.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')
    return [host.replaceAll('.', '[.]'), ...rest].join('/') + tail
  })
}

export function alertMessage(scamText, appUrl) {
  const clean = String(scamText).replace(/\s+/g, ' ').trim()
  const excerpt = clean.length > EXCERPT_MAX ? `${clean.slice(0, EXCERPT_MAX).trim()}…` : clean
  return [
    'سب ہوشیار رہیں! مجھے یہ فراڈ میسج آیا ہے، آپ سب بھی بچ کر رہیں۔',
    '',
    `«${defangLinks(excerpt)}»`,
    '',
    'اس نمبر پر واپس کال نہ کریں اور کسی کو کوڈ نہ بتائیں۔',
    `کوئی بھی میسج یہاں چیک کریں: ${appUrl}`,
  ].join('\n')
}

// wa.me cannot open a particular group, so this opens WhatsApp's chat picker
// with the alert already typed; the family group is picked there.
export function shareUrl(text) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}
