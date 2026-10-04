# Security Policy

Scam SMS Checker is a static, client-only web app. It has no backend, accounts,
cookies or analytics. The message and sender number a user enters are checked
by JavaScript in the browser, kept only in memory, and never uploaded or
written to storage.

## Supported versions

Only the latest version on the `main` branch (and the live site built from it)
receives fixes.

## Reporting a vulnerability

Please email **fazalabbas2002@gmail.com** with a description of the issue,
steps to reproduce, and the browser you used. Do not open a public issue for
security reports.

You can expect an acknowledgement within a week. Once a fix is released you are
welcome to be credited in the release notes.

## Out of scope

A scam message the checker misses, or a genuine message it flags, is a
detection gap rather than a vulnerability. Please report those as a normal
issue using the "Missed scam or false alarm" template.
