# AEM Electron Test

Desktop version of the AEM Angular test (Sign In + protected Dashboard),
built with Electron, with offline login validated through PouchDB.

## Features
Everything from the web app:
- Sign in with reactive form validation (required, email format)
- Token attached to every API call via HttpInterceptor, auto sign-out on 401
- Route guards: AuthGuard protects /dashboard, GuestGuard keeps signed-in users off /sign-in
- Dashboard: donut + bar chart (D3) and user table

Desktop additions:
- Runs as an Electron desktop app
- Login falls back to PouchDB when the API is unreachable
- Last dashboard response cached in PouchDB, shown offline with a "saved on" banner
- Content-Security-Policy restricting scripts to app files and network calls to the AEM API

## Tech Stack
Electron 39, Angular 14, PouchDB, Bootstrap 4.6, D3.js, RxJS

## Prerequisites
- Node.js 16 (see `.nvmrc`)
- Angular CLI 14: `npm install -g @angular/cli@14`

## Getting Started
    git clone https://github.com/arifazfar99/aem-electron-test.git
    cd aem-electron-test
    npm install
    npm run electron

`npm run electron` builds the Angular app and opens it in an Electron window.
`ng serve` still runs the same app in the browser at http://localhost:4200.

## Test Credentials
Username: `user@aemenersol.com`
Password: `Test@123`

## Testing the Offline Fallback
1. Sign in once while online (this stores the credentials and dashboard data).
2. Sign out, open DevTools (Ctrl+Shift+I) > Network, set throttling to **Offline**.
3. Sign in again with the same credentials: you reach the dashboard with cached data.
4. A wrong password offline is still rejected.

## How the Login Fallback Works
1. The login API is always tried first.
2. On success, the username, a salted PBKDF2 hash of the password (100,000 iterations,
   SHA-256, Web Crypto API) and the token are saved to PouchDB. The plain password is never stored.
3. If the API is **unreachable** (network error or 5xx), the credentials are verified
   against PouchDB instead.
4. If the API responds **401**, the error is shown and PouchDB is **not** checked.

The brief's requirement text is cut off ("If the login is invalid, validate the credentials
... through PouchDB"). Taken literally, PouchDB would also be checked after a 401. I chose not
to: if a password is changed or revoked on the server, a locally cached old password would
otherwise still grant access. PouchDB acts as an offline fallback, never as an override of the server.

## Project Structure
    electron/main.js    Electron main process: window, CSP
    src/app/core        auth + credential store (PouchDB), interceptor, guards, dashboard service + cache
    src/app/pages       sign-in, dashboard
    src/app/components  navbar, donut-chart, bar-chart

## Notes
- Electron is pinned to v39, the last major that installs on Node 16 (v40+ requires Node 22).
- The app loads from `file://`, so it uses hash routing (`#/dashboard`) and is built with
  `--base-href ./index.html`, which keeps page reloads working.
- Critical-CSS inlining is disabled because its inline `onload` handler is blocked by the CSP.
- The dashboard cache is shared, not per user; the demo API returns the same data for every user.
- `skipLibCheck` is enabled because `@types/pouchdb-core` and `@types/node` both declare `Buffer`.
- The API returns `chartBar`, not `chartbar` as written in the brief, so the model is typed from the real response.
- `@types/node` and `@types/d3-dispatch` are pinned via `overrides`, because newer versions require TypeScript 5.