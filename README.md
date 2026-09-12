# DTC Planning Poker

A small real-time planning poker room for up to five participants, designed for GitHub Pages.

## Run it

1. Create a Firebase project, then add a web app to it.
2. Enable **Anonymous** sign-in in Firebase Authentication.
3. Create a Realtime Database.
4. Copy `firebase-database.rules.json` into the Realtime Database Rules editor and publish it.
5. Create a GitHub repository named `dtc_planning_poker`, push this project to its `main` branch, then set **Settings → Pages → Build and deployment → GitHub Actions**.
6. In the repo's **Settings → Secrets and variables → Actions**, add these repository secrets from your Firebase web app config:
   - `FIREBASE_API_KEY`
   - `FIREBASE_AUTH_DOMAIN`
   - `FIREBASE_DATABASE_URL`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_STORAGE_BUCKET`
   - `FIREBASE_MESSAGING_SENDER_ID`
   - `FIREBASE_APP_ID`

The included GitHub Actions workflow generates `public/firebase-config.js` from those secrets at deploy time, then publishes the `public` directory on each push to `main`. The real config file is gitignored and never committed.

### Local development

Copy `public/firebase-config.example.js` to `public/firebase-config.js` and fill in your Firebase web app values.

### Tests

Pure logic (deck values, average calculation, status text, HTML escaping) lives in `public/logic.js` and is covered by unit tests in `public/logic.test.js`, run with [Vitest](https://vitest.dev):

```
npm install
npm test
```

## What it does

- Uses Firebase Realtime Database's live connection to synchronize players and votes in real time.
- Allows each player to choose a name and room code.
- Limits each room to five seats.
- Keeps votes hidden until `Reveal estimates` is selected.
- Starts a fresh round without removing the room's players.
