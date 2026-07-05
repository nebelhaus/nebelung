import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const palettePath = path.join(ROOT, 'palette', 'nebelung.hex.json');
const palette = JSON.parse(fs.readFileSync(palettePath, 'utf-8'));

async function fetchImportJson() {
  const envPath = process.env.CATPPUCCIN_USERSTYLES_EXPORT;
  if (envPath && fs.existsSync(envPath)) {
    return JSON.parse(fs.readFileSync(envPath, 'utf-8'));
  }

  // Fallback for manual builds without Nix
  const url = 'https://github.com/catppuccin/userstyles/releases/download/all-userstyles-export/import.json';
  console.log(`fetching ${url} (fallback)`);
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        https.get(res.headers.location, (res2) => {
          let data = '';
          res2.on('data', chunk => data += chunk);
          res2.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
      } else {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(JSON.parse(data)));
      }
    }).on('error', reject);
  });
}

async function main() {
  const importJson = await fetchImportJson();

  // Create the less variable overrides based on Nebelung palette
  const lessOverrides = `
@catppuccin: {
  @latte:     { @rosewater: #dc8a78; @flamingo: #dd7878; @pink: #ea76cb; @mauve: #8839ef; @red: #d20f39; @maroon: #e64553; @peach: #fe640b; @yellow: #df8e1d; @green: #40a02b; @teal: #179299; @sky: #04a5e5; @sapphire: #209fb5; @blue: #1e66f5; @lavender: #7287fd; @text: #4c4f69; @subtext1: #5c5f77; @subtext0: #6c6f85; @overlay2: #7c7f93; @overlay1: #8c8fa1; @overlay0: #9ca0b0; @surface2: #acb0be; @surface1: #bcc0cc; @surface0: #ccd0da; @base: #eff1f5; @mantle: #e6e9ef; @crust: #dce0e8; };
  @frappe:    { @rosewater: #f2d5cf; @flamingo: #eebebe; @pink: #f4b8e4; @mauve: #ca9ee6; @red: #e78284; @maroon: #ea999c; @peach: #ef9f76; @yellow: #e5c890; @green: #a6d189; @teal: #81c8be; @sky: #99d1db; @sapphire: #85c1dc; @blue: #8caaee; @lavender: #babbf1; @text: #c6d0f5; @subtext1: #b5bfe2; @subtext0: #a5adce; @overlay2: #949cbb; @overlay1: #838ba7; @overlay0: #737994; @surface2: #626880; @surface1: #51576d; @surface0: #414559; @base: #303446; @mantle: #292c3c; @crust: #232634; };
  @macchiato: { @rosewater: #f4dbd6; @flamingo: #f0c6c6; @pink: #f5bde6; @mauve: #c6a0f6; @red: #ed8796; @maroon: #ee99a0; @peach: #f5a97f; @yellow: #eed49f; @green: #a6da95; @teal: #8bd5ca; @sky: #91d7e3; @sapphire: #7dc4e4; @blue: #8aadf4; @lavender: #b7bdf8; @text: #cad3f5; @subtext1: #b8c0e0; @subtext0: #a5adcb; @overlay2: #939ab7; @overlay1: #8087a2; @overlay0: #6e738d; @surface2: #5b6078; @surface1: #494d64; @surface0: #363a4f; @base: #24273a; @mantle: #1e2030; @crust: #181926; };
  @mocha:     { @rosewater: #${palette.rosewater}; @flamingo: #${palette.flamingo}; @pink: #${palette.pink}; @mauve: #${palette.mauve}; @red: #${palette.red}; @maroon: #${palette.maroon}; @peach: #${palette.peach}; @yellow: #${palette.yellow}; @green: #${palette.green}; @teal: #${palette.teal}; @sky: #${palette.sky}; @sapphire: #${palette.sapphire}; @blue: #${palette.blue}; @lavender: #${palette.lavender}; @text: #${palette.text}; @subtext1: #${palette.subtext1}; @subtext0: #${palette.subtext0}; @overlay2: #${palette.overlay2}; @overlay1: #${palette.overlay1}; @overlay0: #${palette.overlay0}; @surface2: #${palette.surface2}; @surface1: #${palette.surface1}; @surface0: #${palette.surface0}; @base: #${palette.base}; @mantle: #${palette.mantle}; @crust: #${palette.crust}; };
};
`;

  for (const style of importJson) {
    if (!style.usercssData || !style.sourceCode) continue;

    // 1. Remove @updateURL so Stylus doesn't auto-update and revert our changes
    style.sourceCode = style.sourceCode.replace(/^@updateURL\s+.*$/m, '');
    if (style.updateUrl) {
      delete style.updateUrl;
    }

    // 2. Append our Nebelung overrides directly after the lib.less import
    // Note: Sometimes there might be multiple imports, we want to inject it after the lib.less one.
    const importRegex = /@import\s+("https:\/\/userstyles\.catppuccin\.com\/lib\/lib\.less"|'https:\/\/userstyles\.catppuccin\.com\/lib\/lib\.less');/i;
    style.sourceCode = style.sourceCode.replace(importRegex, (match) => {
      return match + '\n' + lessOverrides;
    });

    // Also change the name slightly so the user knows it's the Nebelung version
    style.name = style.name.replace('Catppuccin', 'Nebelung');
    style.usercssData.name = style.usercssData.name.replace('Catppuccin', 'Nebelung');
    if (style.sourceCode.match(/^@name\s+(.*)$/m)) {
      style.sourceCode = style.sourceCode.replace(/^@name\s+.*$/m, `@name ${style.name}`);
    }
  }

  const outdir = path.join(ROOT, 'dist', 'stylus');
  if (!fs.existsSync(outdir)) {
    fs.mkdirSync(outdir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(outdir, 'nebelung-stylus.json'),
    JSON.stringify(importJson, null, 2)
  );
  
  // Create a README to explain how to use it
  const readme = `# Stylus (Nebelung Port)

This port modifies the official [Catppuccin Userstyles](https://github.com/catppuccin/userstyles) to use the Nebelung palette. 

Because Catppuccin styles are written in LESS and compiled dynamically in the browser, they cannot be natively injected into \`userContent.css\`.

## Installation

1. Install the [Stylus extension](https://add0n.com/stylus.html) in your browser (Zen/Firefox).
2. Open the Stylus dashboard/settings.
3. On the left sidebar under "Manage", click **Import**.
4. Select the \`nebelung-stylus.json\` file located in this directory.
5. Stylus will import all Nebelung-flavored styles and automatically apply them!

*(Auto-updates for these styles have been disabled to prevent them from reverting to the default Catppuccin Mocha colors).*
`;
  fs.writeFileSync(path.join(outdir, 'README.md'), readme);

  console.log('✓ stylus → dist/stylus/ (nebelung-stylus.json, README.md)');
}

main().catch(console.error);
