# Nebelung

A custom [Catppuccin](https://catppuccin.com) flavor — **Mocha with the blue stripped out**.

The entire Catppuccin neutral ramp (`base` → `text`) carries a single ~240° blue
hue. Nebelung rewrites that ramp to a **faint warm graphite grey**, keeping each
color's perceptual lightness identical, then **calms the 14 accents** (chroma ×0.9)
so they sit comfortably against neutral grey instead of a slightly-blue base.

Built with [whiskers](https://whiskers.catppuccin.com): the palette is a
`--color-overrides` file applied to the upstream `mocha` slot of each port's
template, so ports stay in sync with Catppuccin upstream and only the colors change.

## Layout

```
palette/
  nebelung.json       # whiskers --color-overrides file (the source of truth)
  nebelung.hex.json   # flat name→hex map, for reference
scripts/
  generate-palette.mjs# regenerates the palette via OKLCH color math
templates/            # vendored upstream port .tera templates
dist/                 # rendered themes, ready to install
preview/nebelung.html # visual swatch + mockup, rendered through whiskers
ports.conf            # port manifest: name | template | output | extra args
build.sh              # render every port into dist/
```

## Usage

```bash
./build.sh             # regenerate palette + render all ports → dist/
./build.sh --no-gen    # render only (palette unchanged)
```

## Ports

| Port | Output in `dist/` | Install |
| --- | --- | --- |
| Ghostty | `ghostty/themes/catppuccin-mocha.conf` | copy into `~/.config/ghostty/themes/`, then `theme = catppuccin-mocha` |
| Kitty | `kitty/themes/mocha.conf` | copy into `~/.config/kitty/`, then `include mocha.conf` |
| Alacritty | `alacritty/catppuccin-mocha.toml` | import under `[general] import` in `alacritty.toml` |
| Starship | `starship/themes/mocha.toml` | merge into `~/.config/starship.toml` (or `palette = "mocha"`) |
| btop | `btop/themes/catppuccin_mocha.theme` | copy into `~/.config/btop/themes/`, set `color_theme` |
| tmux | `tmux/themes/catppuccin_mocha_tmux.conf` | `source` it from `.tmux.conf` |
| Slack | `slack/README.md` | copy the comma-separated hex string → Slack ▸ Preferences ▸ Themes ▸ paste |
| Zen | `zen/themes/Mocha/<Accent>/userChrome.css` (+ `userContent.css`) | pick an accent folder, copy into your Zen `chrome/` dir |
| Obsidian | `obsidian/nebelung.css` | copy into a vault's `.obsidian/snippets/`, then enable under Settings ▸ Appearance ▸ CSS snippets (use the Default theme) |
| VS Code / Cursor | `vscode/settings.json` | merge into your user `settings.json` (needs the Catppuccin extension) |

VS Code uses the extension's native `catppuccin.colorOverrides` setting — no
build, the palette is just injected via settings. Set `catppuccin.accentColor`
yourself if you want a non-default accent.

### Not yet wired

- **bat** — has no whiskers template upstream; it's a Deno/TypeScript build off
  `@catppuccin/palette`. Producing a Nebelung `.tmTheme` means cloning
  `catppuccin/bat`, patching the palette input, and running its build. Left as a
  TODO — ask and I'll add it.

### Tuning the palette

Edit the `CONFIG` block at the top of `scripts/generate-palette.mjs`:

| knob | meaning |
| --- | --- |
| `neutralHue` | hue (°) of the grey tint — 70 = warm |
| `neutralChroma` | how strong the tint is — bigger = more obvious |
| `accentChromaScale` | accent calming — 0.9 = 10% less saturated |

Re-run `node scripts/generate-palette.mjs` (or `./build.sh`) and re-open
`preview/nebelung.html` to judge.

## Requirements

- [`whiskers`](https://whiskers.catppuccin.com) — `brew install catppuccin/tap/whiskers`
- Node (for the palette generator)
