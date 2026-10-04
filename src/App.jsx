import { useEffect, useRef, useState } from 'react'
import { href, useHashRoute } from './hooks/useHashRoute.js'
import { useOnline } from './hooks/useOnline.js'
import { checkMessage } from './lib/detect.js'
import CheckScreen from './screens/CheckScreen.jsx'
import ResultScreen from './screens/ResultScreen.jsx'
import HelpScreen from './screens/HelpScreen.jsx'
import PrivacyScreen from './screens/PrivacyScreen.jsx'
import NotFoundScreen from './screens/NotFoundScreen.jsx'

const THEME = { scam: '#e74c3c', safe: '#2ecc71', none: '#f4f3ef' }

export default function App() {
  const route = useHashRoute()
  const online = useOnline()
  // The pasted message lives only in memory: nothing is stored or sent.
  const [draft, setDraft] = useState({ text: '', sender: '' })
  const [result, setResult] = useState(null)
  const mainRef = useRef(null)
  const firstRender = useRef(true)

  const showingResult = route === 'result' && result
  const screen = route === 'result' && !result ? 'home' : route

  // A reload loses the in-memory result, so the URL goes back to the form.
  useEffect(() => {
    if (route === 'result' && !result) window.history.replaceState(null, '', href('home'))
  }, [route, result])

  useEffect(() => {
    const verdict = showingResult ? result.verdict : 'none'
    document.documentElement.dataset.verdict = verdict
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME[verdict])
  }, [showingResult, result])

  // Move focus to the new screen's heading so screen readers announce it.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    window.scrollTo(0, 0)
    mainRef.current?.querySelector('h1')?.focus()
  }, [screen])

  function check() {
    setResult({ ...checkMessage(draft.text, draft.sender), text: draft.text })
    window.location.hash = href('result')
  }

  function startOver() {
    setDraft({ text: '', sender: '' })
    setResult(null)
    window.location.hash = href('home')
  }

  function tryExample(example) {
    setDraft(example)
    window.location.hash = href('home')
  }

  let content
  if (screen === 'home') content = <CheckScreen draft={draft} onChange={setDraft} onCheck={check} />
  else if (showingResult) content = <ResultScreen result={result} online={online} onAgain={startOver} />
  else if (screen === 'help') content = <HelpScreen onTry={tryExample} />
  else if (screen === 'privacy') content = <PrivacyScreen />
  else content = <NotFoundScreen />

  return (
    <>
      {!online && !showingResult && (
        <p className="banner" role="status">
          انٹرنیٹ بند ہے۔ فکر نہ کریں، میسج اسی فون میں چیک ہوتا ہے۔
        </p>
      )}
      <main className={showingResult ? `result result-${result.verdict}` : 'page'} ref={mainRef}>
        {content}
      </main>
    </>
  )
}
