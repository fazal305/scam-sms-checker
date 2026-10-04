import { href } from '../hooks/useHashRoute.js'

export default function NotFoundScreen() {
  return (
    <div className="not-found">
      <h1 className="app-title" tabIndex={-1}>
        یہ صفحہ نہیں ملا
      </h1>
      <p>شاید لنک غلط ہے۔ کوئی بات نہیں۔</p>
      <a className="btn btn-check" href={href('home')}>
        میسج چیک کرنے والے صفحے پر جائیں
      </a>
    </div>
  )
}
