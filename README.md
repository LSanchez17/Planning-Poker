# DTC Planning Poker

A small real-time planning poker room for up to five participants, designed for GitHub Pages.

## Run it

1. Create a Firebase project, then add a web app to it.
2. Enable **Anonymous** sign-in in Firebase Authentication.
3. Create a Realtime Database, then paste your Firebase web configuration into `public/firebase-config.js`.
4. Copy `firebase-database.rules.json` into the Realtime Database Rules editor and publish it.
5. Create a GitHub repository named `dtc_planning_poker`, push this project to its `main` branch, then set **Settings → Pages → Build and deployment → GitHub Actions**.

The included GitHub Actions workflow will publish the `public` directory on each push to `main`.

## What it does

- Uses Firebase Realtime Database's live connection to synchronize players and votes in real time.
- Allows each player to choose a name and room code.
- Limits each room to five seats.
- Keeps votes hidden until Reveal estimates is selected.
- Starts a fresh round without removing the room's players.

Rooms are stored in Firebase. A player automatically releases their seat when they disconnect.
