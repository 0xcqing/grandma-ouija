import { chmodSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const WORD = "Ouija";
const MIN_LENGTH = 1;
const MAX_LENGTH = 30;

function fail(message: string): never {
  process.stderr.write(`entry: ${message}\n`);
  process.exit(1);
}

function codePointLength(value: string): number {
  return [...value].length;
}

const outputDir =
  process.env.MAKEFUN_OUTPUT_DIR && process.env.MAKEFUN_OUTPUT_DIR.trim() !== ""
    ? process.env.MAKEFUN_OUTPUT_DIR
    : "/output";
const outputPath = join(outputDir, "entry.txt");

const wordChars = codePointLength(WORD);
const wordBytes = Buffer.byteLength(WORD, "utf8");

if (wordChars < MIN_LENGTH || wordChars > MAX_LENGTH) {
  fail(
    `word must be ${MIN_LENGTH}..${MAX_LENGTH} characters, got ${wordChars}: ${JSON.stringify(WORD)}`,
  );
}
if (wordBytes < MIN_LENGTH || wordBytes > MAX_LENGTH) {
  fail(
    `word must be ${MIN_LENGTH}..${MAX_LENGTH} bytes, got ${wordBytes}: ${JSON.stringify(WORD)}`,
  );
}
if (WORD.trim() === "") {
  fail("word must not be only white space");
}
if (/\s/.test(WORD)) {
  fail(
    `word must be a single word with no spaces, tabs or newlines: ${JSON.stringify(WORD)}`,
  );
}
if (!/^[A-Za-z]+$/.test(WORD)) {
  fail(
    `word must be plain letters only: no punctuation, digits or symbols, got ${JSON.stringify(WORD)}`,
  );
}

const text = `${WORD}\n`;
const textChars = codePointLength(text);
const textBytes = Buffer.byteLength(text, "utf8");

if (textChars < MIN_LENGTH || textChars > MAX_LENGTH) {
  fail(
    `file text must be ${MIN_LENGTH}..${MAX_LENGTH} characters, got ${textChars}`,
  );
}
if (textBytes < MIN_LENGTH || textBytes > MAX_LENGTH) {
  fail(`file text must be ${MIN_LENGTH}..${MAX_LENGTH} bytes, got ${textBytes}`);
}

mkdirSync(outputDir, { recursive: true, mode: 0o755 });
writeFileSync(outputPath, text, { encoding: "utf8", mode: 0o644 });
chmodSync(outputPath, 0o644);

const expectedBytes = Buffer.from(text, "utf8");
const writtenBytes = readFileSync(outputPath);
if (!writtenBytes.equals(expectedBytes)) {
  fail(
    `read-back mismatch at ${outputPath}: expected ${JSON.stringify(text)} (${expectedBytes.length} bytes), got ${JSON.stringify(writtenBytes.toString("utf8"))} (${writtenBytes.length} bytes)`,
  );
}

const readBack = writtenBytes.toString("utf8");
if (readBack !== text) {
  fail(`read-back text mismatch at ${outputPath}: ${JSON.stringify(readBack)}`);
}

process.stdout.write(`word: ${JSON.stringify(WORD)}\n`);
process.stdout.write(`charCount: ${wordChars}\n`);
process.stdout.write(`byteCount: ${wordBytes}\n`);
process.stdout.write(`fileSize: ${writtenBytes.length}\n`);
process.stdout.write(`text: ${JSON.stringify(text)}\n`);
process.stdout.write(`path: ${outputPath}\n`);
