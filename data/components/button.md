# Button

Triggers an action or submits a form. The most-used interactive component in the system.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'tertiary' \| 'danger'` | `'primary'` | Visual emphasis. Use one primary button per view. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Maps to density-aware spacing tokens. |
| `disabled` | `boolean` | `false` | Disabled buttons are not focusable; explain why the action is unavailable nearby. |
| `loading` | `boolean` | `false` | Shows a spinner and sets `aria-busy="true"`. |
| `onClick` | `(event) => void` | — | Click handler. |

## Design tokens

- Padding: `spacing.sm` (sm), `spacing.md` (md), `spacing.lg` (lg)
- Background: `color.primary` / `color.surface` / `color.danger` by variant
- Border radius: `radius.md`
- Type: `type.label.md`

## Usage

- One primary action per screen. Everything else is secondary or tertiary.
- In compact density, Button automatically uses the next-smaller spacing step.

## Accessibility

- Renders a native `<button>` — never a `<div onClick>`.
- Minimum target size 24x24 CSS px (WCAG 2.2 AA); `lg` meets 44x44.
- Color is never the only indicator: `danger` also carries an icon.
