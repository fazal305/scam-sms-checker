import ScreenHeader from '../components/ScreenHeader.jsx'

// Invented for demonstration; the numbers are not real.
const EXAMPLES = [
  {
    label: 'BISP کے نام پر فراڈ',
    text: 'مبارک ہو! آپ کی بینظیر انکم سپورٹ کی 25000 روپے کی قسط آ گئی ہے۔ وصول کرنے کے لیے فوراً اس نمبر پر کال کریں 0300-0000000',
    sender: '0311 0000000',
  },
  {
    label: 'انعام کا لالچ',
    text: 'جیتو پاکستان کی طرف سے آپ کا انعام 50,000 روپے نکلا ہے۔ آپ کے فون پر آنے والا کوڈ ہمیں بتا دیں۔',
    sender: '',
  },
  {
    label: 'عام سچا میسج',
    text: 'آپ کا تصدیقی کوڈ 5521 ہے۔ یہ کوڈ کسی کو نہ بتائیں۔',
    sender: '',
  },
]

const SIGNS = [
  'BISP یا بینظیر پروگرام کا میسج جو 8171 کے علاوہ کسی نمبر سے آئے',
  'انعام، لاٹری، قرعہ اندازی یا «آپ کا نمبر نکلا ہے»',
  'اکاؤنٹ، کارڈ یا سم بند ہونے کا ڈراوا',
  'کوڈ، پن یا پاس ورڈ مانگنا',
  'بینک، جیز کیش یا ایزی پیسہ کے نام پر عام موبائل نمبر',
  '«غلطی سے پیسے بھیج دیے، واپس کر دیں»',
  'چھپے ہوئے (چھوٹے) لنک، فیس یا ایزی لوڈ کی مانگ، اور جلدی کا دباؤ',
]

export default function HelpScreen({ onTry }) {
  return (
    <>
      <ScreenHeader title="یہ کیسے کام کرتا ہے؟" />

      <section className="card prose">
        <h2 className="card-title">یہ نشانیاں دیکھی جاتی ہیں</h2>
        <ul>
          {SIGNS.map((sign) => (
            <li key={sign}>{sign}</li>
          ))}
        </ul>
        <p>ان میں سے کوئی بڑی نشانی ملے، یا دو چھوٹی نشانیاں اکٹھی ملیں، تو اسکرین سرخ ہو جاتی ہے۔</p>
      </section>

      <section className="card prose">
        <h2 className="card-title">اہم سوال</h2>
        <h3>کیا میرا میسج کہیں جاتا ہے؟</h3>
        <p>نہیں۔ میسج اسی فون میں چیک ہوتا ہے اور کہیں محفوظ بھی نہیں ہوتا۔</p>
        <h3>کیا جواب ہمیشہ درست ہوتا ہے؟</h3>
        <p>
          نہیں۔ یہ ایپ عام فراڈ کی نشانیاں پہچانتی ہے۔ کوئی نیا طریقہ ہو تو شاید نہ پکڑ سکے۔ ہرا جواب آنے پر بھی کسی کو
          کوڈ یا پن مت بتائیں، اور شک ہو تو گھر کے کسی فرد سے پوچھ لیں۔
        </p>
        <h3>BISP کی سچی معلومات کیسے لیں؟</h3>
        <p>اپنا شناختی کارڈ نمبر خود 8171 پر SMS کریں۔ کسی کے بتائے ہوئے نمبر یا لنک پر نہ جائیں۔</p>
        <h3>بینک یا جیز کیش / ایزی پیسہ کا میسج ہو تو؟</h3>
        <p>میسج میں دیے گئے نمبر پر نہیں، بلکہ اپنے کارڈ یا ایپ پر لکھے ہوئے آفیشل نمبر پر خود کال کریں۔</p>
        <h3>«آواز میں سنیں» دبانے پر آواز نہیں آتی؟</h3>
        <p>
          آواز فون کی اپنی بولنے والی سہولت سے آتی ہے۔ اینڈرائیڈ فون میں سیٹنگ کے اندر «Text-to-speech» کھول کر Google کی
          اردو یا ہندی آواز ڈاؤن لوڈ کر لیں۔
        </p>
        <h3>کیا یہ انٹرنیٹ کے بغیر چلتی ہے؟</h3>
        <p>جی ہاں۔ ایک بار کھولنے کے بعد میسج چیک کرنے کے لیے انٹرنیٹ کی ضرورت نہیں۔</p>
      </section>

      <section className="card prose" aria-labelledby="examples-title">
        <h2 id="examples-title" className="card-title">
          نمونے کے میسج آزمائیں
        </h2>
        <p className="muted">یہ فرضی میسج ہیں، ان میں کوئی اصل نمبر نہیں۔</p>
        <ul className="examples">
          {EXAMPLES.map((example) => (
            <li key={example.label}>
              <button type="button" className="btn btn-quiet" onClick={() => onTry(example)}>
                {example.label}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="card card-quiet prose" lang="en" dir="ltr">
        <h2 className="card-title">About and disclaimer</h2>
        <p>
          Scam SMS Checker flags common Pakistani SMS scams (fake BISP payments, prize draws, blocked-account threats,
          requests for codes) with rules that run entirely in your browser. A green result only means none of the known
          warning signs were found; it is not a guarantee. The app is provided as-is, without warranty, under the MIT
          License.
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
