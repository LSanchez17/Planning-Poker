import { escapeHtml, calculateAverage, formatStatus } from "./logic.js";

export function buildDeck(deckElement, cards) {
  for (const value of cards) {
    const button = document.createElement("button");
    button.className = "card";
    button.textContent = value;
    button.setAttribute("aria-label", `Estimate ${value}`);
    deckElement.append(button);
  }
}

export function renderRoom({ state, playerId, myVote, elements }) {
  const { status, seats, average, revealButton } = elements;
  const voted = state.players.filter((player) => player.hasVoted).length;
  status.textContent = formatStatus(state);

  seats.innerHTML = "";

  [...state.players, ...Array(Math.max(0, 7 - state.players.length)).fill(null)].forEach((player, index) => {
    const seat = document.createElement("article");
    seat.className = `seat ${player ? "occupied" : "empty"}`;
    seat.innerHTML = player
      ? `<div class="avatar">${escapeHtml(player.name).slice(0, 1).toUpperCase()}</div><div><strong>${escapeHtml(player.name)}${player.id === playerId ? " <small>(you)</small>" : ""}</strong><p>${state.revealed ? (player.vote ?? "No estimate") : (player.hasVoted ? "Estimate selected" : "Thinking…")}</p></div><div class="vote ${player.hasVoted ? "chosen" : ""}">${state.revealed ? escapeHtml(player.vote ?? "—") : (player.hasVoted ? "✓" : "")}</div>`
      : `<div class="empty-seat">Seat ${index + 1}<span>Open</span></div>`;
    seats.append(seat);
  });

  const roundedAverage = calculateAverage(state.players);
  average.classList.toggle("hidden", !state.revealed || roundedAverage === null);

  if (state.revealed && roundedAverage !== null) average.textContent = `Average: ${roundedAverage}`;

  document.querySelectorAll(".card").forEach((button) => {
    button.classList.toggle("selected", button.textContent === myVote && !state.revealed);
    button.disabled = state.revealed;
  });
  revealButton.disabled = state.revealed || voted === 0;
  revealButton.textContent = state.revealed ? "Estimates revealed" : "Reveal estimates";
}
