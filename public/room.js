import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getDatabase, onDisconnect, onValue, ref, runTransaction, update } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

export async function joinRoom(name, roomCode) {
  const credential = await signInAnonymously(auth);
  const playerId = credential.user.uid;
  const roomRef = ref(database, `rooms/${roomCode}`);
  const playerRef = ref(database, `rooms/${roomCode}/players/${playerId}`);
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

  return { playerId, roomRef, playerRef };
}

export function subscribeToRoom(roomRef, onRoomState) {
  return onValue(roomRef, (snapshot) => {
    const room = snapshot.val() || { players: {}, revealed: false };
    const state = {
      revealed: Boolean(room.revealed),
      players: Object.entries(room.players || {}).map(([id, player]) => ({ id, ...player, hasVoted: player.vote != null })),
    };
    onRoomState(state);
  });
}

export function castVote(playerRef, value) {
  return update(playerRef, { vote: value });
}

export function revealEstimates(roomRef) {
  return update(roomRef, { revealed: true });
}

export function startNewRound(roomRef) {
  return runTransaction(roomRef, (room) => {
    if (!room) return room;
    room.revealed = false;
    Object.values(room.players || {}).forEach((player) => { player.vote = null; });
    return room;
  });
}
