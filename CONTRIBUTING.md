# Contributing

Thanks for wanting to help with Scam SMS Checker.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
```

Before opening a pull request, run the same checks CI runs:

```bash
npm run lint
npm test
npm run build
npm run e2e      # first time: npx playwright install chromium
```

## Improving detection

The rules live in `src/lib/detect.js` and the sample messages they are tested
against live in `src/lib/detect.test.js`.

- Add the message you are fixing to `SCAMS` or `GENUINE` in the test file first,
  and watch it fail.
- Prefer a weak signal (counted only in pairs) over a strong one unless the
  pattern almost never appears in a genuine message.
- Add a genuine counter-example for every new keyword so false alarms show up.

## Things to keep in mind

- **Urdu first, plain words.** Every on-screen sentence is short, simple Urdu.
- **Large and clear.** Text stays at 26px or larger and buttons stay big
  enough to press comfortably. Check at 375px wide with no sideways scrolling.
- **Nothing leaves the phone.** No network calls, analytics or storage of the
  pasted message.
- **Accessible.** Keep labelled fields, visible focus and the
  `prefers-reduced-motion` behaviour working.

## Pull requests

- Keep changes focused; one topic per pull request.
- Describe what changed and how you tested it (browser and screen size).
- Never include real people's names, real phone numbers or real messages from
  someone's phone in issues, tests or screenshots. Replace them with made-up
  ones.

By contributing you agree that your work is released under the MIT License and
that you will follow the [Code of Conduct](CODE_OF_CONDUCT.md).
