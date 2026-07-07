# Nebelung — design conventions

Nebelung is a **dark-only color system** (a silver-mist Catppuccin Mocha variant). There are no components in this project — build with generic components, colored exclusively via the Nebelung CSS custom properties below. Never hardcode hex values; every color comes from a `var(--nebelung-*)`.

## Setup

`styles.css` defines every token on `:root` and sets `body { background: var(--nebelung-bg); color: var(--nebelung-fg); }`. No provider or wrapper is needed — link the stylesheet and the variables resolve everywhere.

## The vocabulary

Semantic aliases (prefer these):

| Variable | Use for |
|---|---|
| `--nebelung-bg` / `--nebelung-bg-alt` / `--nebelung-bg-deep` | page background / panels & sidebars / wells, code blocks |
| `--nebelung-fg` / `--nebelung-fg-muted` | primary text / secondary text |
| `--nebelung-border` | borders, dividers |
| `--nebelung-accent` | primary actions, links, focus rings (this is mauve — the system's one default accent) |
| `--nebelung-success` / `--nebelung-warning` / `--nebelung-danger` / `--nebelung-info` | status colors (green / yellow / red / teal) |

Raw palette, from darkest to lightest: `--nebelung-crust`, `--nebelung-mantle`, `--nebelung-base` (backgrounds); `--nebelung-surface0/1/2` (raised UI: cards, inputs, hover states); `--nebelung-overlay0/1/2` (disabled text, placeholders, subtle icons); `--nebelung-subtext0/1`, `--nebelung-text` (foregrounds). Accent hues: `--nebelung-rosewater`, `-flamingo`, `-pink`, `-mauve`, `-red`, `-maroon`, `-peach`, `-yellow`, `-green`, `-teal`, `-sky`, `-sapphire`, `-blue`, `-lavender`.

Rules of the look:
- Dark only — never invert to a light theme.
- Mauve (`--nebelung-accent`) is THE accent; other hues are for status, syntax-highlight-like variety, and data viz, not for competing CTAs.
- Elevation is expressed by stepping surfaces (`base` → `surface0` → `surface1`), not by shadows.
- Accent colors are pastel and light — use them as text/icons/borders on dark surfaces, or as fills with dark (`--nebelung-crust`) text on top.

## Where the truth lives

- `tokens/nebelung.css` — every variable definition (imported by `styles.css`).
- `tokens/nebelung.json` — the same palette as a `name → #hex` map.

## Idiomatic snippet

```jsx
<div style={{ background: 'var(--nebelung-bg-alt)', border: '1px solid var(--nebelung-border)', borderRadius: 8, padding: 16 }}>
  <h3 style={{ color: 'var(--nebelung-fg)' }}>Card title</h3>
  <p style={{ color: 'var(--nebelung-fg-muted)' }}>Supporting text.</p>
  <button style={{ background: 'var(--nebelung-accent)', color: 'var(--nebelung-crust)', border: 'none', borderRadius: 6, padding: '8px 14px' }}>
    Primary action
  </button>
</div>
```
