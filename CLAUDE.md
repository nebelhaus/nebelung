# CLAUDE.md

**Nebelung** — a silver-mist Catppuccin variant (Mocha with the blue stripped),
built with [whiskers](https://github.com/catppuccin/whiskers). The single source of
truth for colors across the whole [nebelhaus](https://github.com/nebelhaus) family.

## Am I in the right repo? (routing)

**This repo (`~/code/nebelhaus/nebelung`) owns THE COLORS** — the palette and the
per-tool theme templates. Nothing about *how* tools are configured, only how they're
colored.

| Want to change… | Repo |
|---|---|
| colors / the palette, or how a tool is themed | `~/code/nebelhaus/nebelung` ← **you are here** |
| which tools exist / how they're configured (shell, bar, WM) | `~/code/nebelhaus/nebelhaus` |
| the pounce app | `~/code/nebelhaus/pounce` |
| this machine's config | `~/.config/nix` |

> **Claude: enforce this.** If a request is about a tool's *behavior/config* (not its
> colors), STOP — that's a rice change in `~/code/nebelhaus/nebelhaus`. Only palette
> and theme-template changes belong here.

## How it works

- `palette/nebelung.hex.json` → the `name → #hex` map. The flake exposes it as the
  `palette` output; consumers inject it directly (e.g. a starship `[palettes.*]` table).
- `templates/` → whiskers templates, one per tool (bat, delta, ghostty, zellij, …).
- `ports.conf` → which ports get rendered.
- `packages.<system>.default` → the built theme tree (every port rendered), consumed by
  `nebelhaus` via `${nebelung.packages.${system}.default}/<tool>/...`.

## Recolor

Edit the palette (`palette/`), rebuild:

```bash
nix build            # renders every port with the new palette
```

Then push, and in `nebelhaus`: `nix flake update nebelung` + push; in a consumer:
`nix flake update nebelhaus` + rebuild. **One palette edit recolors every tool at once.**

For fast iteration from a consumer without the push/relock loop, override against this
local checkout: `--override-input nebelhaus/nebelung "path:$HOME/code/nebelhaus/nebelung"`.

## Add a themed tool

Add a whiskers template under `templates/`, register it in `ports.conf`, rebuild. Then
wire the rendered file into the tool's config over in `nebelhaus` (usually `hearth`).

## Conventions

- MIT, public. The palette is the source of truth — don't hardcode hex values in
  `nebelhaus`; inject `nebelung.palette` or reference the rendered theme tree (`packages.<system>.default`).
