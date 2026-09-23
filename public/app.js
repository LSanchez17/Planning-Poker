import { cards, isUnanimous } from "./logic.js";
import { joinRoom, subscribeToRoom, castVote, revealEstimates, startNewRound } from "./room.js";
import { buildDeck, renderRoom } from "./render.js";
import { launchConfetti } from "./confetti.js";

const joinScreen = document.querySelector("#join-screen");
const gameScreen = document.querySelector("#game-screen");
const deck = document.querySelector("#deck");
const seats = document.querySelector("#seats");
const status = document.querySelector("#status");
const average = document.querySelector("#average");
const revealButton = document.querySelector("#reveal");
const resetButton = document.querySelector("#reset");
const confettiCanvas = document.querySelector("#confetti");

let myVote = null;
let state = null;
let playerId = null;
let playerRef = null;
let roomRef = null;
let celebratedRound = false;

buildDeck(deck, cards);

document.querySelector("#join-form").addEventListener("submit", (event) => {
  event.preventDefault();
  handleJoin().catch((error) => document.querySelector("#join-error").textContent = error.message || "Unable to join this room.");
});

async function handleJoin() {
  const name = document.querySelector("#name").value.trim().slice(0, 30);
  const roomCode = document.querySelector("#room-code").value.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 20);
  if (!name || !roomCode) throw new Error("Enter your name and a room code.");

  const joined = await joinRoom(name, roomCode);
  playerId = joined.playerId;
  roomRef = joined.roomRef;
  playerRef = joined.playerRef;

  document.querySelector("#room-title").textContent = roomCode;
  joinScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");

  subscribeToRoom(roomRef, (nextState) => {
    state = nextState;
    myVote = state.players.find((player) => player.id === playerId)?.vote ?? null;
    render();
  });
}

function render() {
  renderRoom({ state, playerId, myVote, elements: { status, seats, average, revealButton } });

  if (!state.revealed) {
    celebratedRound = false;
  } else if (!celebratedRound && isUnanimous(state.players)) {
    celebratedRound = true;
    launchConfetti(confettiCanvas);
  }
}

deck.addEventListener("click", async (event) => {
  const value = event.target.closest(".card")?.textContent;
  if (value && !state.revealed) await castVote(playerRef, value);
});
revealButton.addEventListener("click", () => revealEstimates(roomRef));
resetButton.addEventListener("click", () => startNewRound(roomRef));
