import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getDatabase, onDisconnect, onValue, ref, runTransaction, update } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const cards = ["1", "2", "3", "4", "5", "8", "?", "☕"];
const joinScreen = document.querySelector("#join-screen");
const gameScreen = document.querySelector("#game-screen");
const deck = document.querySelector("#deck");
const seats = document.querySelector("#seats");
const status = document.querySelector("#status");
const revealButton = document.querySelector("#reveal");
const resetButton = document.querySelector("#reset");
let myVote = null;
let state = null;
let playerId = null;
let playerRef = null;
let roomRef = null;

for (const value of cards) {
  const button = document.createElement("button");
  button.className = "card";
  button.textContent = value;
  button.setAttribute("aria-label", `Estimate ${value}`);
  deck.append(button);
}

document.querySelector("#join-form").addEventListener("submit", (event) => {
  event.preventDefault();
  joinRoom().catch((error) => document.querySelector("#join-error").textContent = error.message || "Unable to join this room.");
});

async function joinRoom() {
  const name = document.querySelector("#name").value.trim().slice(0, 30);
  const roomCode = document.querySelector("#room-code").value.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 20);
  if (!name || !roomCode) throw new Error("Enter your name and a room code.");
  const credential = await signInAnonymously(auth);
  playerId = credential.user.uid;
  roomRef = ref(database, `rooms/${roomCode}`);
  playerRef = ref(database, `rooms/${roomCode}/players/${playerId}`);
  const result = await runTransaction(roomRef, (room) => {
    room ??= { players: {}, revealed: false };
    room.players ??= {};
    const otherPlayers = Object.entries(room.players).filter(([id]) => id !== playerId).map(([, player]) => player);
    if (otherPlayers.some((player) => player.name?.toLowerCase() === name.toLowerCase())) return;
    if (!room.players[playerId] && otherPlayers.length >= 5) return;
    room.players[playerId] = { name, vote: null };
    return room;
  });
  if (!result.committed) throw new Error("That room is full or the name is already taken.");
  await onDisconnect(playerRef).remove();
  document.querySelector("#room-title").textContent = roomCode;
  joinScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  onValue(roomRef, (snapshot) => {
    const room = snapshot.val() || { players: {}, revealed: false };
    state = { revealed: Boolean(room.revealed), players: Object.entries(room.players || {}).map(([id, player]) => ({ id, ...player, hasVoted: player.vote != null })) };
    myVote = state.players.find((player) => player.id === playerId)?.vote ?? null;
    render();
  });
}

function render() {
  const voted = state.players.filter((player) => player.hasVoted).length;
  status.textContent = state.revealed ? "Estimates revealed" : `${voted} of ${state.players.length} estimates selected`;
  seats.innerHTML = "";
  [...state.players, ...Array(Math.max(0, 5 - state.players.length)).fill(null)].forEach((player, index) => {
    const seat = document.createElement("article");
    seat.className = `seat ${player ? "occupied" : "empty"}`;
    seat.innerHTML = player
      ? `<div class="avatar">${escapeHtml(player.name).slice(0, 1).toUpperCase()}</div><div><strong>${escapeHtml(player.name)}${player.id === playerId ? " <small>(you)</small>" : ""}</strong><p>${state.revealed ? (player.vote ?? "No estimate") : (player.hasVoted ? "Estimate selected" : "Thinking…")}</p></div><div class="vote ${player.hasVoted ? "chosen" : ""}">${state.revealed ? escapeHtml(player.vote ?? "—") : (player.hasVoted ? "✓" : "")}</div>`
      : `<div class="empty-seat">Seat ${index + 1}<span>Open</span></div>`;
    seats.append(seat);
  });
  document.querySelectorAll(".card").forEach((button) => {
    button.classList.toggle("selected", button.textContent === myVote && !state.revealed);
    button.disabled = state.revealed;
  });
  revealButton.disabled = state.revealed || voted === 0;
  revealButton.textContent = state.revealed ? "Estimates revealed" : "Reveal estimates";
}

function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]); }
deck.addEventListener("click", async (event) => {
  const value = event.target.closest(".card")?.textContent;
  if (value && !state.revealed) await update(playerRef, { vote: value });
});
revealButton.addEventListener("click", () => update(roomRef, { revealed: true }));
resetButton.addEventListener("click", () => runTransaction(roomRef, (room) => {
  if (!room) return room;
  room.revealed = false;
  Object.values(room.players || {}).forEach((player) => { player.vote = null; });
  return room;
}));
