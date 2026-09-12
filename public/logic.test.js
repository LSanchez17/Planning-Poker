import { describe, expect, it } from "vitest";
import { cards, escapeHtml, calculateAverage, formatStatus } from "./logic.js";

describe("cards", () => {
  it("has the supported deck values", () => {
    expect(cards).toEqual(["1", "2", "3", "4", "5", "8", "?", "☕"]);
  });
});

describe("escapeHtml", () => {
  it("escapes html-significant characters", () => {
    expect(escapeHtml(`<script>alert('x')</script> & "quotes"`)).toBe(
      "&lt;script&gt;alert(&#39;x&#39;)&lt;/script&gt; &amp; &quot;quotes&quot;"
    );
  });

  it("passes through plain text unchanged", () => {
    expect(escapeHtml("Luis")).toBe("Luis");
  });
});

describe("calculateAverage", () => {
  it("returns null when no players have voted", () => {
    expect(calculateAverage([{ vote: null }, { vote: null }])).toBeNull();
  });

  it("ignores non-numeric votes like ? and coffee", () => {
    expect(calculateAverage([{ vote: "3" }, { vote: "?" }, { vote: "☕" }])).toBe(3);
  });

  it("returns null when every vote is non-numeric", () => {
    expect(calculateAverage([{ vote: "?" }, { vote: "☕" }])).toBeNull();
  });

  it("always rounds up, even for an exact tie", () => {
    expect(calculateAverage([{ vote: "1" }, { vote: "2" }])).toBe(2);
  });

  it("rounds up a fractional average", () => {
    expect(calculateAverage([{ vote: "1" }, { vote: "1" }, { vote: "2" }])).toBe(2);
  });

  it("returns the exact value for a single voter", () => {
    expect(calculateAverage([{ vote: "5" }])).toBe(5);
  });
});

describe("formatStatus", () => {
  it("reports revealed state regardless of vote counts", () => {
    expect(formatStatus({ revealed: true, players: [] })).toBe("Estimates revealed");
  });

  it("counts how many players have voted so far", () => {
    const players = [{ hasVoted: true }, { hasVoted: false }, { hasVoted: true }];
    expect(formatStatus({ revealed: false, players })).toBe("2 of 3 estimates selected");
  });

  it("handles an empty room", () => {
    expect(formatStatus({ revealed: false, players: [] })).toBe("0 of 0 estimates selected");
  });
});
