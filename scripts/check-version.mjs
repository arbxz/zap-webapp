#!/usr/bin/env node
// Fails unless the app version on --head is higher than on --base (arbxz-practices).
// Usage: node scripts/check-version.mjs [--base origin/main] [--head HEAD] [--file package.json]
// In a monorepo, pass --file for each app that changed, e.g. --file apps/web/package.json.
import { execFileSync } from "node:child_process";

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};
const base = opt("base", "origin/main");
const head = opt("head", "HEAD");
const files = args.flatMap((a, i) => (a === "--file" ? [args[i + 1]] : []));
if (!files.length) files.push("package.json");

const show = (ref, file) => {
  try {
    return execFileSync("git", ["show", `${ref}:${file}`], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return null;
  }
};
const parse = (v) => v.split("-")[0].split(".").map(Number);
const greater = (a, b) => {
  const [x, y] = [parse(a), parse(b)];
  for (let i = 0; i < 3; i++)
    if ((x[i] ?? 0) !== (y[i] ?? 0)) return (x[i] ?? 0) > (y[i] ?? 0);
  return false;
};

let failed = false;
for (const file of files) {
  const after = show(head, file);
  if (!after) {
    console.error(`check-version: ${file} not found on ${head}`);
    failed = true;
    continue;
  }
  const next = JSON.parse(after).version;
  if (!next) {
    console.error(`check-version: ${file} has no "version" field on ${head}`);
    failed = true;
    continue;
  }
  const before = show(base, file);
  if (!before) {
    console.log(`check-version: ${file} is new on this branch (${next}), ok`);
    continue;
  }
  const prev = JSON.parse(before).version;
  if (!prev) {
    console.log(
      `check-version: ${file} had no version on ${base}, now ${next}, ok`,
    );
    continue;
  }
  if (greater(next, prev))
    console.log(`check-version: ${file} ${prev} -> ${next}, ok`);
  else {
    console.error(
      `check-version: ${file} is still ${next} (${base} has ${prev}). Bump it, e.g. npm version minor --no-git-tag-version`,
    );
    failed = true;
  }
}
process.exit(failed ? 1 : 0);
