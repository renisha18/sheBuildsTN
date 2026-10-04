# SheBuilds Tamil Nadu

Community website for SheBuilds Tamil Nadu. Vite + React + Tailwind v4
(tokens live in src/index.css @theme; there is no tailwind.config.js).

## Design rules
- Neobrutalist: border-2 border-ink, hard offset shadows (shadow-brutal,
  shadow-brutal-sm), flat colors, no blur, no gradients.
- Colors only through tokens: primary (maroon), accent (coral),
  accent-alt (teal), danger (deep red), background (cream), surface,
  ink, muted. No raw hex and no arbitrary [..] values.
- Buttons are pills (rounded-full) with a press effect:
  active:translate-x-0.5 active:translate-y-0.5 and a smaller shadow.
- The logo and mascot illustration are never boxed.
- font-display (Space Grotesk) for headings, font-body (Inter) for text.

## Structure
- Sections live in src/sections/<name>/ and share one sticky Navbar.

## Workflow
- One small change at a time. Don't restyle unrelated components.
- Don't take screenshots or run headless browser checks unless I ask;
  I'll check in my browser. Run `npm run build` and `npm run lint` at the end.
- Placeholder content must be clearly placeholder. Don't invent facts.