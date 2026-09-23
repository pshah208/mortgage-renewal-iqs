# frontend

### App

Mortgage Renewal Concierge web app. It presents a guided six-chapter story beside a live agent chat and lights IQ cards from observed tool activity.

### Tech stack

- React 18, TypeScript, Vite.
- `@azure/msal-browser` and `@azure/msal-react`.
- nginx container for production static hosting.

Verified in `app/src/web/package.json:1-23`, `app/README.md:1-5`.

### Repos / paths

- This repo -> `app/src/web/`.
- Main surface -> `app/src/web/src/App.tsx`.
- Chat -> `app/src/web/src/components/ChatPanel.tsx`.
- Story -> `app/src/web/src/components/StoryPanel.tsx`.

### Build & run

- `npm install`
- Create `.env` with `VITE_AAD_TENANT_ID`, `VITE_AAD_CLIENT_ID`, and `VITE_API_SCOPE`.
- `npm run dev`
- Build with `npm run build`.
- For UI-only work, set BFF `MOCK_MODE=true`.

Verified in `app/README.md:111-124`.

### Key user flows

- Sign in -> bootstrap config/story/profile -> guided story or Explore mode.
- Choose a chapter prompt -> stream agent response -> show citations and IQ activity.
- Open diagnostics -> run token/OBO/agent checks.
- Display policy-approved offer flyer from `/api/offers`.

### Risks / pain points

- The frontend relies on the BFF SSE contract; no generated client contract was found.
- No frontend test script is defined in `app/src/web/package.json:6-10`.
- **Inferred:** accessibility and browser support requirements are not documented.

### Open questions

- **Unknown:** supported browsers and accessibility acceptance criteria.
- **Unknown:** whether the `VITE_*` values are injected at build time or runtime in production.
