import { isUtf8 } from "node:buffer";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const dataDir = path.resolve("question-bank/data");
const decoder = new TextDecoder("windows-1252");
const utf8Decoder = new TextDecoder("utf-8", { fatal: true });
const cp1252SpecialBytes = new Map([
  ["€", 0x80], ["‚", 0x82], ["ƒ", 0x83], ["„", 0x84], ["…", 0x85], ["†", 0x86], ["‡", 0x87],
  ["ˆ", 0x88], ["‰", 0x89], ["Š", 0x8a], ["‹", 0x8b], ["Œ", 0x8c], ["Ž", 0x8e], ["‘", 0x91],
  ["’", 0x92], ["“", 0x93], ["”", 0x94], ["•", 0x95], ["–", 0x96], ["—", 0x97], ["˜", 0x98],
  ["™", 0x99], ["š", 0x9a], ["›", 0x9b], ["œ", 0x9c], ["ž", 0x9e], ["Ÿ", 0x9f],
]);

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? filesIn(fullPath) : entry.name.endsWith(".jsonl") ? [fullPath] : [];
  }));
  return nested.flat();
}

function repairMojibake(value) {
  if (!/[ÃÂâ]/.test(value)) return value;
  const bytes = [];
  for (const character of value) {
    const specialByte = cp1252SpecialBytes.get(character);
    if (specialByte !== undefined) bytes.push(specialByte);
    else if (character.codePointAt(0) <= 0xff) bytes.push(character.codePointAt(0));
    else return value;
  }
  try {
    return utf8Decoder.decode(Uint8Array.from(bytes));
  } catch {
    return value;
  }
}

function repairValue(value) {
  if (typeof value === "string") return repairMojibake(value);
  if (Array.isArray(value)) return value.map(repairValue);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, repairValue(item)]));
  return value;
}

for (const filePath of await filesIn(dataDir)) {
  const bytes = await readFile(filePath);
  const source = isUtf8(bytes) ? bytes.toString("utf8") : decoder.decode(bytes);
  const normalized = source
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line, index) => {
      try {
        return JSON.stringify(repairValue(JSON.parse(line)));
      } catch (error) {
        throw new Error(`${path.relative(process.cwd(), filePath)}: linha ${index + 1} inválida`, { cause: error });
      }
    })
    .join("\n") + "\n";

  if (normalized !== source) {
    await writeFile(filePath, normalized, "utf8");
    console.log(`normalizado: ${path.relative(process.cwd(), filePath)}`);
  }
}
