# Threat Model

## Project Overview

HosFlow/Hova is a Vite + React single-page application for hospitality operations. There is no custom backend in this repository; production behavior is primarily a browser client that authenticates users with Supabase Auth and then calls third-party vendor APIs directly from the browser for channel management, smart-lock control, booking automation, and notifications.

Production-relevant code lives mainly under `src/`. `docs/` contains design and future backend notes but is not production code unless separately implemented. Per scan assumptions, dev-only mockup/sandbox behavior is ignored unless production reachability is evident.

## Assets

- **User accounts and sessions** — Supabase-authenticated sessions gate access to the PMS UI.
- **Third-party integration credentials** — Channex API keys, TTLock access/refresh tokens, Beds24 tokens, and EmailJS configuration grant access to bookings, guest messaging, or physical lock control.
- **Guest and reservation data** — booking records, guest names, emails, phone numbers, arrival/departure dates, reviews, and messages fetched from Channex.
- **Physical access controls** — TTLock operations can unlock doors and create guest passcodes, so compromise has real-world impact.
- **Check-in and access artifacts** — generated check-in records, guest identity/signature data, Wi-Fi credentials, and door PINs stored in browser storage.

## Trust Boundaries

- **Browser to Supabase** — the client is untrusted; authentication must be enforced by Supabase/session checks and protected UI state must not be bypassable.
- **Browser to third-party APIs** — the browser directly calls Channex, TTLock, Beds24, and EmailJS. Any credential available to the browser should be treated as exposed to the end user and to any script executing in the origin.
- **Unauthenticated to authenticated application state** — public landing/demo/check-in routes are reachable without Supabase auth. They must not expose or unlock privileged PMS features or persisted third-party credentials.
- **Browser memory/storage to subsequent sessions** — `localStorage` persists across logouts and browser restarts. Sensitive tokens or guest data stored there remain available to later users of the same browser profile.

## Scan Anchors

- Production entry point: `src/App.jsx`
- Auth/session handling: `src/components/modules/AuthPage.jsx`, `src/components/layout/TopHeader.jsx`, `src/lib/supabase.js`
- Highest-risk code: `src/lib/ttlock.js`, `src/lib/automation.js`, `src/components/modules/SmartLockHub.jsx`, `src/components/modules/ChannelManager.jsx`, `src/components/modules/AutomationHub.jsx`
- Public surfaces: landing page, `?demo` flow, and `?checkin=` guest check-in route in `src/App.jsx`
- Dev-only / usually out of scope: `docs/`, `.bak` files, static demo content unless referenced by production code

## Threat Categories

### Spoofing

Supabase is the only real authentication boundary in this repo. The application must not let URL flags, demo buttons, or client-side state transitions impersonate an authenticated operator for production workflows. Third-party callbacks/webhooks are not implemented in production code here, so the main spoofing risk is unauthorized entry into the privileged PMS UI.

### Tampering

The browser directly issues state-changing requests to Channex and TTLock, including availability updates, rate updates, lock/unlock commands, and PIN creation. All credentials used for those calls must be protected from exposure to unauthorized users, and security-sensitive values such as guest door PINs must be generated unpredictably rather than derived from guessable booking data.

### Information Disclosure

This app processes guest PII, booking details, reviews, messages, Wi-Fi credentials, and door access codes. Those values must not be exposed through browser storage, public routes, or client-bundled secrets in ways that let unrelated users recover them.

### Elevation of Privilege

Compromise of Channex or TTLock credentials lets an attacker move from viewing PMS data to modifying reservations or controlling physical locks. Confidential OAuth client secrets must not be embedded in a public frontend, and public/demo routes must not provide a path to reuse persisted privileged tokens from a prior session.
