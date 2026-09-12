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

Copy `public/firebase-config.example.js` to `public/firebase-config.js` and fill in your Firebase web app values. That file is gitignored, so it stays local.

> Note: Firebase's client-side web config (API key, project ID, etc.) isn't a true secret — it's normally safe to ship in a public client bundle, since access is actually controlled by your [Realtime Database security rules](firebase-database.rules.json) and Firebase Auth, not by hiding this config. Keeping it out of the repo here is mainly about tidiness/not having it grep-able, not a real security boundary — make sure your database rules are locked down regardless.

## What it does

- Uses Firebase Realtime Database's live connection to synchronize players and votes in real time.
- Allows each player to choose a name and room code.
- Limits each room to five seats.
- Keeps votes hidden until Reveal estimates is selected.
- Starts a fresh round without removing the room's players.

Rooms are stored in Firebase. A player automatically releases their seat when they disconnect.
