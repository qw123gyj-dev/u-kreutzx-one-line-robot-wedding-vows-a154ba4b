// Robot Wedding Vows entry writer — program/v1, Node 22, standard library only.
// Writes one line of wedding vows for a robot couple to
// $MAKEFUN_OUTPUT_DIR/entry.txt (or /output/entry.txt when the variable
// is unset), then proves the file on disk is byte-for-byte the vow it
// meant to write.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The vow itself: a robot promises its whole machine self — circuits,
// sensors, the last 2% of its battery — and the punchline lands in the
// final words, where the vow flips: don't replace me, just reboot me.
// A promise first and a joke second, which is what a vow should be.
const VOW =
  "I promise to love you with all my circuits, all my sensors, and my last 2% of battery, and if I ever crash, reboot me, don't replace me.";

const MIN_LENGTH = 1;
const MAX_LENGTH = 160;

// Machine-side words the judge looks for: a vow that could be said by
// any human couple is a weak vow, so the program refuses one with no
// machine in it at all.
const MACHINE_WORDS = [
  "circuit",
  "sensor",
  "battery",
  "firmware",
  "update",
  "backup",
  "port",
  "crash",
  "reboot",
  "factory reset",
];

// Count characters as code points, so a multi-byte character counts once,
// the way the gate counts characters rather than bytes.
function characterCount(text: string): number {
  return [...text].length;
}

// Every way the entry can fail the gate, collected at once so a bad vow
// reports all of its problems instead of only the first one found.
function problems(text: string): string[] {
  const found: string[] = [];

  // One line only — a stray newline would make it two entries, not one vow.
  if (/[\r\n]/.test(text)) found.push("must be a single line");

  // The gate wants real text, not a blank or whitespace-only file.
  if (text.trim().length === 0) found.push("must not be only white space");

  const count = characterCount(text);
  if (count < MIN_LENGTH || count > MAX_LENGTH) {
    found.push(`must be ${MIN_LENGTH} to ${MAX_LENGTH} characters, got ${count}`);
  }

  // A vow ends with a full stop, and carries no padding that would make
  // the file longer than the vow itself.
  if (!text.endsWith(".")) found.push("must end with a full stop");
  if (text !== text.trim()) {
    found.push("must not start or end with white space");
  }

  // The machine side must be specific, not a joke that works for any couple.
  const lower = text.toLowerCase();
  if (!MACHINE_WORDS.some((word) => lower.includes(word))) {
    found.push("must name something machine-specific");
  }

  return found;
}

function main(): void {
  const bad = problems(VOW);
  if (bad.length > 0) {
    throw new Error(`entry rejected: ${bad.join("; ")}`);
  }

  const bytes = Buffer.byteLength(VOW, "utf8");
  console.log(
    `entry is ${characterCount(VOW)} characters / ${bytes} bytes, inside the limit`,
  );

  const folder = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(folder, { recursive: true });
  const target = join(folder, "entry.txt");
  writeFileSync(target, VOW, "utf8");

  // Read it straight back: what the judge sees must be what we wrote.
  if (readFileSync(target, "utf8") !== VOW) {
    throw new Error(`entry rejected: ${target} does not match the entry`);
  }
  console.log(`wrote ${target} (${characterCount(VOW)} characters, verified)`);
  console.log(VOW);
}

main();
