#!/usr/bin/env node
// Emit a VS Code / Cursor settings.json snippet for the Catppuccin extension.
// The extension's `catppuccin.colorOverrides` takes the same name→hex shape as
// our palette, so Nebelung needs no build — just these settings.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const hex = JSON.parse(readFileSync(join(root, "palette", "nebelung.hex.json")));
const mocha = Object.fromEntries(
  Object.entries(hex).map(([k, v]) => [k, `#${v}`]),
);

const settings = {
  "workbench.colorTheme": "Catppuccin Mocha",
  "catppuccin.colorOverrides": { mocha },
};
mkdirSync(join(root, "dist", "vscode"), { recursive: true });
writeFileSync(
  join(root, "dist", "vscode", "settings.json"),
  JSON.stringify(settings, null, 2) + "\n",
);
console.log("✓ vscode → dist/vscode/settings.json");
