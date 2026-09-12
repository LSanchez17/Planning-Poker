export const cards = ["1", "2", "3", "4", "5", "8", "?", "☕"];

export function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
}

export function calculateAverage(players) {
  const numericVotes = players.filter((player) => player.vote != null).map((player) => Number(player.vote)).filter((vote) => Number.isFinite(vote));
  if (numericVotes.length === 0) return null;
  const mean = numericVotes.reduce((sum, vote) => sum + vote, 0) / numericVotes.length;
  return Math.ceil(mean);
}

export function formatStatus(state) {
  if (state.revealed) return "Estimates revealed";
  const voted = state.players.filter((player) => player.hasVoted).length;
  return `${voted} of ${state.players.length} estimates selected`;
}
