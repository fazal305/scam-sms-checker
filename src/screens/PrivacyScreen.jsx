import ScreenHeader from '../components/ScreenHeader.jsx'

export default function PrivacyScreen() {
  return (
    <>
      <ScreenHeader title="آپ کا ڈیٹا" />
      <section className="card prose">
        <h2 className="card-title">میسج صرف آپ کے فون میں رہتا ہے</h2>
        <ul>
          <li>آپ کا میسج اسی فون کے اندر چیک ہوتا ہے۔ یہ کسی سرور پر نہیں جاتا۔</li>
          <li>میسج کہیں محفوظ بھی نہیں ہوتا۔ صفحہ بند کرتے ہی مٹ جاتا ہے۔</li>
          <li>کوئی اکاؤنٹ، کوکیز، اشتہار یا ٹریکنگ نہیں۔</li>
          <li>واٹس ایپ پیغام صرف تب جاتا ہے جب آپ خود واٹس ایپ میں «بھیجیں» دبائیں۔</li>
        </ul>
      </section>
      <section className="card card-quiet prose" lang="en" dir="ltr">
        <h2 className="card-title">Privacy, in English</h2>
        <p>
          The message you paste and the sender number are checked by JavaScript in your browser and kept only in memory
          until you close or reload the page. They are never uploaded or written to storage. There are no accounts,
          cookies, analytics or ads.
        </p>
        <p>
          The spoken warning uses your device&apos;s own speech engine. Some browsers use online voices that send the
          text being spoken to their provider; that text is only the fixed warning sentence, never your message. The
          WhatsApp alert (which quotes the message, with links disabled) leaves your phone only if you press send
          inside WhatsApp.
        </p>
        <p>
          Source code and contact:{' '}
          <a href="https://github.com/fazal305/scam-sms-checker" target="_blank" rel="noopener noreferrer">
            github.com/fazal305/scam-sms-checker
          </a>
        </p>
      </section>
    </>
  )
}
