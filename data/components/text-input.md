# TextInput

Single-line text entry with label, hint, and error states. Always pair with a visible label.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Visible label. Required. |
| `hint` | `string` | — | Help text rendered below the input, linked via `aria-describedby`. |
| `error` | `string` | — | Error message. Sets `aria-invalid="true"` and `aria-describedby` to the error. |
| `required` | `boolean` | `false` | Adds a required indicator and `aria-required`. |
| `disabled` | `boolean` | `false` | — |

## Design tokens

- Padding: `spacing.sm` vertical, `spacing.md` horizontal
- Border: `border.width.sm` in `color.border`; error state uses `color.danger`
- Border radius: `radius.sm`
- Type: `type.body.md`

## Usage

- One question per input. Split "First name / Last name" into two inputs rather than one clever one.
- Error messages say what went wrong and how to fix it: "Enter a 5-digit ZIP code", not "Invalid input".

## Accessibility

- Label is always rendered and programmatically associated — placeholder text is never a substitute.
- Error announcements use `aria-live="polite"` regions so screen-reader users hear them without focus theft.
