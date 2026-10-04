import { describe, expect, it } from 'vitest'
import { checkMessage, findLinks, findMobileNumbers, senderKind } from './detect.js'
import { defangLinks, alertMessage } from './whatsapp.js'
import { normalize } from './text.js'

// Made-up messages modelled on common Pakistani SMS scams and on ordinary
// genuine messages. No real numbers or people.
const SCAMS = [
  ['BISP payment from a mobile number', 'مبارک ہو! آپ کی بینظیر انکم سپورٹ کی 25000 روپے کی قسط آ گئی ہے۔ وصول کرنے کے لیے رابطہ کریں', '03001234567'],
  ['BISP with a number to call', 'BISP 8171: Aap ki raqam 14500 jari ho gayi hai. Foran is number par call karein 0311-7654321'],
  ['BISP with no sender given', 'محترمہ آپ کا نام بے نظیر کفالت پروگرام میں شامل ہو گیا ہے۔'],
  ['BISP from another short code', 'Benazir Income Support: apni qist ke liye link kholen', '9900'],
  ['Jeeto Pakistan prize', 'جیتو پاکستان کی طرف سے آپ کا انعام 50,000 روپے اور ایک موٹر سائیکل نکلا ہے۔'],
  ['Roman Urdu lottery', 'Mubarak ho! Aap ka number lucky draw mein nikla hai. Inaam ke liye 0345 1112223 par rabta karein'],
  ['English prize', 'Congratulations! You are the WINNER of Rs.500,000 prize. Call now.'],
  ['Account block threat in Urdu', 'آپ کا جیز کیش اکاؤنٹ 24 گھنٹے میں بلاک کر دیا جائے گا۔ فوری رابطہ کریں'],
  ['Account block in Roman Urdu', 'Easypaisa: aap ka account band ho raha hai, tasdeeq ke liye call karein'],
  ['SIM block by PTA', 'PTA notice: your SIM will be blocked today. Reply with your CNIC to avoid suspension'],
  ['Wallet "helpline" with a mobile number', 'JazzCash Helpline 0301-9988776 se aap ko call aye gi, maloomat de dein'],
  ['Ask for the code', 'Aap ke mobile par 6 hindsay ka code aaya hai woh humein bata dein taake inaam bhej sakein'],
  ['Ask for the code in Urdu', 'آپ کے فون پر آنے والا کوڈ ہمیں بتا دیں'],
  ['Wrong transfer', 'Assalam o alaikum, maine galti se aap ke number par 2000 ka balance bhej diya hai, please wapis kar dein'],
  ['Wrong transfer in Urdu', 'بھائی غلطی سے آپ کے اکاؤنٹ میں 5000 روپے ٹرانسفر ہو گئے ہیں، مہربانی کر کے واپس بھیج دیں'],
  ['Short link', 'Your parcel is held at the warehouse. Pay the fee here: bit.ly/3xYzAbc'],
  ['WhatsApp link', 'Mubarak! Aap ki imdad manzoor. Tafseel ke liye wa.me/923001112223'],
  ['Link plus money', 'Ehsaas program se 12000 ki imdad hasil karein: www.ehsaas-registration.online'],
  ['CNIC to a mobile number', 'اپنا شناختی کارڈ نمبر 03214567890 پر بھیجیں'],
  ['Fee before payout', 'Aap ki raqam tayyar hai, sirf 500 rupay fee easyload kar dein'],
  ['Urdu digits in the number', 'آپ کی امداد آ گئی ہے، فوراً ۰۳۰۰۱۲۳۴۵۶۷ پر کال کریں'],
  ['Diacritics and Arabic letters', 'آپ نے انعَام جیتا ہے، رابطہ كريں'],
]

const GENUINE = [
  ['Real 8171 message from 8171', 'BISP: Aap ki Benazir Kafaalat ki qist ke liye apne qareebi campsite tashreef layen. Shukriya 8171', '8171'],
  ['Bank OTP that warns not to share', 'Your OTP for login is 482913. Do not share this code with anyone. HBL'],
  ['Urdu OTP that warns not to share', 'آپ کا تصدیقی کوڈ 5521 ہے۔ یہ کوڈ کسی کو نہ بتائیں۔'],
  ['JazzCash receipt', 'JazzCash: Rs.1,500 received from ALI. Your new balance is Rs.3,240. TID 1234567'],
  ['Family message', 'Ammi main ghar pohanch gaya hoon, khana kha liya. Kal subah baat karta hoon'],
  ['Family message in Urdu', 'امی جان شام کو خالہ کے گھر جانا ہے، تیار رہیے گا۔'],
  ['Family message with a number', 'Beta ye mere naye number hai 0300 1234567 save kar lo'],
  ['Delivery update with an official link', 'Aap ka bijli ka bill jama ho gaya. Tafseel: www.lesco.gov.pk'],
  ['Appointment reminder', 'Reminder: aap ki doctor appointment kal 11 baje hai. Clinic'],
  ['Word that contains a short keyword', 'آج موسم بہت اچھا ہے، اس قسم کی بارش کم ہوتی ہے۔ matlab maza aa gaya'],
  ['Taxi is not tax', 'Taxi aa gayi hai, neeche aa jao. Feel better soon'],
]

describe('checkMessage', () => {
  it.each(SCAMS)('flags: %s', (_name, text, sender) => {
    const result = checkMessage(text, sender)
    expect(result.verdict, JSON.stringify(result.flags)).toBe('scam')
    expect(result.reasons.length).toBeGreaterThan(0)
  })

  it.each(GENUINE)('passes: %s', (_name, text, sender) => {
    const result = checkMessage(text, sender)
    expect(result.verdict, JSON.stringify(result.flags)).toBe('safe')
    expect(result.reasons).toEqual([])
  })

  it('applies the 8171 rule to the sender', () => {
    const text = 'BISP: aap ki qist jari ho gayi hai'
    expect(checkMessage(text, '8171').verdict).toBe('safe')
    expect(checkMessage(text, '+92 300 1234567').flags).toContain('bisp-mobile')
    expect(checkMessage(text, '0300-1234567').flags).toContain('bisp-mobile')
    expect(checkMessage(text, '9900').flags).toContain('bisp-other')
    expect(checkMessage(text, '').flags).toContain('bisp-unverified')
  })

  it('still flags a message from 8171 that asks you to call a mobile number', () => {
    expect(checkMessage('BISP: apni raqam ke liye 03001234567 par call karein', '8171').verdict).toBe('scam')
  })

  it('answers well inside the 0.5 second budget even for a very long paste', () => {
    const long = 'آپ کا انعام نکلا ہے بھائی '.repeat(200)
    const started = performance.now()
    for (let i = 0; i < 20; i++) checkMessage(long, '03001234567')
    expect((performance.now() - started) / 20).toBeLessThan(50)
  })
})

describe('helpers', () => {
  it('classifies senders', () => {
    expect(senderKind('8171')).toBe('bisp')
    expect(senderKind('۸۱۷۱')).toBe('bisp')
    expect(senderKind('0092 300 1234567')).toBe('mobile')
    expect(senderKind('JazzCash')).toBe('other')
    expect(senderKind('  ')).toBe('unknown')
  })

  it('finds Pakistani mobile numbers in any common format', () => {
    expect(findMobileNumbers('call 0300-1234567 or +92 321 7654321')).toEqual(['03001234567', '923217654321'])
    expect(findMobileNumbers('UAN 111-225-225 and 042-35761234')).toEqual([])
  })

  it('finds links and their hosts', () => {
    expect(findLinks(normalize('Visit https://Bit.ly/abc, or www.example.com/x.')).map((l) => l.host)).toEqual([
      'bit.ly',
      'example.com',
    ])
    expect(findLinks('Rs.500 e.g. 3.5')).toEqual([])
  })
})

describe('whatsapp alert', () => {
  it('defangs links so nobody can tap them', () => {
    expect(defangLinks('open https://bit.ly/x now or www.scam.pk')).toBe('open bit[.]ly/x now or scam[.]pk')
  })

  it('builds the family alert with the quoted message', () => {
    const msg = alertMessage('Claim at bit.ly/abc', 'https://example.test/')
    expect(msg).toContain('سب ہوشیار رہیں! مجھے یہ فراڈ میسج آیا ہے، آپ سب بھی بچ کر رہیں۔')
    expect(msg).toContain('bit[.]ly/abc')
    expect(msg).not.toContain('bit.ly')
  })

  it('shortens very long quoted messages', () => {
    const msg = alertMessage('ا'.repeat(1000), 'https://example.test/')
    expect(msg.length).toBeLessThan(500)
    expect(msg).toContain('…')
  })
})
