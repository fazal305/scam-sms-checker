import { normalize, toAsciiDigits } from './text.js'

// \p{L} covers Urdu and Latin letters alike, so these act as word boundaries
// in both scripts (JavaScript's \b only understands ASCII).
const START = '(?<!\\p{L})'
const END = '(?!\\p{L})'
const word = (...alts) => `${START}(?:${alts.join('|')})${END}`
const stem = (...alts) => `${START}(?:${alts.join('|')})`
const re = (source) => new RegExp(source, 'u')
// Both terms inside the same sentence, in either order.
const near = (a, b, gap = 40) =>
  `(?:${a})[^.۔!?؟]{0,${gap}}(?:${b})|(?:${b})[^.۔!?؟]{0,${gap}}(?:${a})`

const BISP = re(
  stem(
    'bisp',
    'benazir',
    'benzir',
    'be nazir',
    'بے ?نظیر',
    'بینظیر',
    'انکم سپورٹ',
    'income support',
    'احساس (?:پروگرام|کفالت)',
    'ehsaas (?:program|kafalat)',
    'کفالت پروگرام',
    'kafaa?lat',
  ) + '|8171',
)

const PRIZE = re(
  stem(
    'انعام',
    'لاٹری',
    'قرعہ ?اندازی',
    'جیتو پاکستان',
    'jeeto pakistan',
    'lotte?ry',
    'lotery',
    'prize',
    'inaa?m',
    'winner',
    'lucky draw',
    'lucky number',
    'آپ نے جیت',
    'aap ne jeet',
    'ap ne jeet',
  ) +
    '|' +
    near(
      stem('آپ کا', 'aap ka', 'ap ka') + ' ?(?:موبائل )?(?:نمبر|number|سم|sim)',
      stem('نکل', 'nikl', 'منتخب', 'select', 'jeet', 'جیت'),
    ),
)

const ACCOUNT =
  stem('account', 'acount', 'اکاؤنٹ', 'اکاونٹ', 'اکائونٹ', 'card', 'کارڈ', 'wallet', 'والٹ') + '|' + word('sim', 'سم')
const BLOCKED =
  stem('block', 'بلاک', 'suspend', 'معطل', 'deactivat', 'freeze', 'فریز', 'expire') + '|' + word('band', 'بند')
const ACCOUNT_BLOCK = re(near(ACCOUNT, BLOCKED))

const WALLET = re(
  stem(
    'jazz ?cash',
    'jaz ?cash',
    'جیز ?کیش',
    'جاز ?کیش',
    'easy ?paisa',
    'easy ?pesa',
    'ایزی ?پیس',
    'sadapay',
    'nayapay',
    'bank',
    'بینک',
  ),
)
const HELPLINE = re(
  stem('help ?line', 'ہیلپ ?لائن', 'customer (?:care|service)', 'کسٹمر ?(?:کیئر|کئیر|سروس)', 'head office', 'ہیڈ ?آفس'),
)

const SECRET = stem('code', 'کوڈ', 'otp', 'password', 'pass word', 'پاس ?ورڈ', 'verification') + '|' + word('pin', 'پن')
const HAND_OVER =
  stem('bata', 'بتا', 'send', 'بھیج', 'share', 'شیئر', 'forward', 'فارورڈ', 'reply', 'ریپلائی', 'likh', 'لکھ') +
  '|' +
  word('دیں', 'dein', 'de do', 'دے دیں')
const ASK_SECRET = re(near(SECRET, HAND_OVER))
// Genuine OTP messages warn the reader not to share the code.
const NEGATED = re(
  word('mat', 'مت', 'never', 'kabhi', 'کبھی') +
    '|' +
    stem('do not', "don't", 'dont', 'کسی کو نہ', 'کسی کو بھی نہ', 'kisi ko na', 'share na', 'نہ بتائ', 'نہ دی'),
)

const CNIC = re(stem('cnic', 'شناختی', 'id card'))

const WRONG_TRANSFER = re(
  near(
    stem('غلطی سے', 'galti se', 'ghalti se', 'ghalati se', 'by mistake', 'mistake se', 'غلط نمبر', 'wrong number'),
    stem('پیسے', 'بیلنس', 'balance', 'pais', 'raqam', 'رقم', 'load', 'لوڈ', 'transfer', 'ٹرانسفر', 'bhej', 'بھیج'),
    60,
  ),
)

const URGENCY = re(
  stem(
    'فوری',
    'فوراً',
    'فورا',
    'جلد از جلد',
    'آخری موقع',
    'آخری تاریخ',
    'آج ہی',
    'urgent',
    'immediately',
    'foran',
    'last chance',
    'today only',
    'aaj hi',
  ) + '|24 ?(?:گھنٹ|hour|ghant)',
)
const FEE = re(
  word('fee', 'فیس', 'tax', 'ٹیکس') +
    '|' +
    stem('charges', 'چارجز', 'easy ?load', 'ایزی ?لوڈ') +
    '|' +
    near(stem('balance', 'بیلنس'), stem('bhej', 'بھیج', 'send')),
)
const MONEY = re(
  stem('rs\\.? ?\\d', 'pkr ?\\d', 'رقم', 'raqam', 'قسط', 'qist', 'امداد', 'imdad') + '|\\d[\\d,]* ?(?:روپے|rs|pkr)',
)

const SHORTENERS = new Set([
  'bit.ly',
  'tinyurl.com',
  't.ly',
  'cutt.ly',
  'rb.gy',
  'is.gd',
  'goo.gl',
  'shorturl.at',
  'tiny.cc',
  's.id',
  't.co',
  'ow.ly',
  'wa.me',
  'wa.link',
])
const isOfficialHost = (host) =>
  host === 'gov.pk' || host.endsWith('.gov.pk') || /(?:^|\.)(?:jazzcash|easypaisa)\.com\.pk$/.test(host)

export const URL_LIKE =
  /(?:https?:\/\/|www\.)[^\s]+|(?<![\p{L}\d@.-])[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|net|org|pk|xyz|top|info|online|site|live|link|club|shop|me|ly|gl|gd|io|co|app|id|at|cc)(?![\p{L}\d-])(?:\/[^\s]*)?/giu

export function findLinks(text) {
  return [...String(text).matchAll(URL_LIKE)].map((m) => {
    const raw = m[0].replace(/[.,;:!?)\]}»"'۔،]+$/u, '')
    const host = raw
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .split(/[/?#:]/)[0]
      .toLowerCase()
    return { raw, host }
  })
}

const MOBILE = /^(?:92|0092|0)?3\d{9}$/

export function findMobileNumbers(text) {
  const runs = toAsciiDigits(text).match(/\+?\d[\d\s-]{8,16}\d/g) ?? []
  return runs.map((run) => run.replace(/\D/g, '')).filter((digits) => MOBILE.test(digits))
}

export function senderKind(sender) {
  const digits = toAsciiDigits(sender ?? '').replace(/[\s()+-]/g, '')
  if (!digits) return 'unknown'
  if (digits === '8171') return 'bisp'
  if (MOBILE.test(digits)) return 'mobile'
  return 'other'
}

export const REASONS = {
  'bisp-mobile': 'BISP کا سچا میسج صرف 8171 سے آتا ہے، کسی موبائل نمبر سے نہیں۔',
  'bisp-other': 'یہ میسج BISP کے نام پر ہے مگر 8171 سے نہیں آیا۔',
  'bisp-unverified':
    'اس میں BISP یا بینظیر پروگرام کا ذکر ہے۔ ان کا سچا میسج صرف 8171 سے آتا ہے، کسی اور نمبر سے آیا ہو تو فراڈ ہے۔',
  'bisp-call-mobile': 'BISP کبھی کسی موبائل نمبر پر کال یا رابطہ کرنے کو نہیں کہتا۔',
  prize: 'اس میں انعام، لاٹری یا قرعہ اندازی کا لالچ دیا گیا ہے۔',
  'account-block': 'اس میں اکاؤنٹ یا سم بند ہونے کا ڈراوا دیا گیا ہے۔',
  'wallet-mobile': 'بینک، جیز کیش یا ایزی پیسہ کبھی عام موبائل نمبر سے رابطہ نہیں کرتے۔',
  'ask-secret': 'اس میں کوڈ، پن یا پاس ورڈ بتانے کو کہا گیا ہے۔',
  'cnic-mobile': 'اس میں شناختی کارڈ نمبر کسی موبائل نمبر پر بھیجنے کو کہا گیا ہے۔',
  'wrong-transfer': '«غلطی سے پیسے بھیج دیے، واپس کر دیں» پرانا فراڈ ہے۔',
  'short-link': 'اس میں چھپا ہوا (چھوٹا) لنک ہے۔ اسے مت کھولیں۔',
  'wallet-helpline': 'اس میں بینک یا جیز کیش / ایزی پیسہ کی «ہیلپ لائن» کا ذکر ہے۔',
  link: 'اس میں کسی ویب سائٹ کا لنک ہے۔',
  'mobile-in-text': 'اس میں ایک موبائل نمبر دیا گیا ہے۔',
  urgency: 'اس میں فوراً کچھ کرنے کا دباؤ ڈالا گیا ہے۔',
  fee: 'اس میں فیس، ٹیکس یا ایزی لوڈ مانگا گیا ہے۔',
  money: 'اس میں رقم ملنے کی بات کی گئی ہے۔',
}

// Any strong flag is enough on its own; weak flags also turn up in genuine
// messages, so it takes two of them together to call a message a scam.
export function checkMessage(text, sender = '') {
  const t = normalize(text)
  const from = senderKind(sender)
  const numbers = findMobileNumbers(t)
  const links = findLinks(t).filter((l) => !isOfficialHost(l.host))
  const strong = []
  const weak = []

  if (BISP.test(t)) {
    if (from === 'mobile') strong.push('bisp-mobile')
    else if (from === 'other') strong.push('bisp-other')
    else if (from === 'unknown') strong.push('bisp-unverified')
    if (numbers.length > 0) strong.push('bisp-call-mobile')
  }

  if (PRIZE.test(t)) strong.push('prize')
  if (ACCOUNT_BLOCK.test(t)) strong.push('account-block')

  const mentionsWallet = WALLET.test(t)
  if (mentionsWallet && (numbers.length > 0 || from === 'mobile')) strong.push('wallet-mobile')
  if (ASK_SECRET.test(t) && !NEGATED.test(t)) strong.push('ask-secret')
  if (CNIC.test(t) && numbers.length > 0) strong.push('cnic-mobile')
  if (WRONG_TRANSFER.test(t)) strong.push('wrong-transfer')
  if (links.some((l) => SHORTENERS.has(l.host))) strong.push('short-link')

  if (mentionsWallet && HELPLINE.test(t)) weak.push('wallet-helpline')
  if (links.length > 0 && !strong.includes('short-link')) weak.push('link')
  if (numbers.length > 0 && !strong.some((id) => id.endsWith('mobile'))) weak.push('mobile-in-text')
  if (URGENCY.test(t)) weak.push('urgency')
  if (FEE.test(t)) weak.push('fee')
  if (MONEY.test(t)) weak.push('money')

  const isScam = strong.length > 0 || weak.length >= 2
  const flags = [...strong, ...weak]
  return {
    verdict: isScam ? 'scam' : 'safe',
    flags,
    reasons: isScam ? flags.map((id) => REASONS[id]) : [],
  }
}
