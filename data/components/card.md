# Card

A container that groups related content and actions on a single topic.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | — | Card heading. Rendered as the correct heading level for context. |
| `actions` | `ReactNode` | — | Footer action area. Use Button components. |
| `elevated` | `boolean` | `false` | Adds shadow instead of border. |

## Design tokens

- Padding: `spacing.lg`
- Gap between sections: `spacing.md`
- Border: `border.width.sm` in `color.border`, radius `radius.lg`
- Shadow (elevated): `shadow.md`

## Usage

- Cards group content; they are not buttons. If the whole card is clickable, use a real link or button pattern with a stretched-link utility instead.
- Keep one primary action in the footer.

## Accessibility

- The `title` prop renders the right heading rank — don't hardcode `<h2>` inside a card that sits under an `<h4>` context.
