# The Founder Nation — Mobile App

The Founder Nation (TFN) mobile application foundation.

> **CURRENT PHASE: PHASE 0 — FOUNDATION**

Phase 0 establishes the stable mobile development foundation. Product features and the WordPress content engine are intentionally deferred.

## Tech stack

- React Native
- Expo
- TypeScript
- Expo Router
- Supabase client foundation
- GitHub

WordPress remains TFN's editorial CMS. The mobile app will consume WordPress content through a service/API layer beginning in Phase 1; there is no duplicate editorial workflow.

## Requirements

- Node.js LTS
- npm
- Expo-compatible development environment
- For native device work: iOS/Android tooling as appropriate

## Install

```bash
npm install
```

## Environment

Copy `.env.example` to `.env.local` and provide the public client configuration values required for your environment.

```text
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_WORDPRESS_BASE_URL=https://thefoundernation.com/
```

Only public client values belong in Expo's `EXPO_PUBLIC_*` variables. Never commit service-role keys, passwords, or other secrets.

## Development

Start Expo:

```bash
npm run start
```

Native:

```bash
npm run ios
npm run android
```

Browser preview:

```bash
npm run web
```

## Validation

TypeScript:

```bash
npm run typecheck
```

Lint:

```bash
npm run lint
```

Full Phase 0 validation:

```bash
npm run check
```

## Architecture

```text
app/                  Expo Router routes only
src/
  components/ui/      Small reusable UI primitives
  config/             Runtime/public configuration
  constants/           App-level constants
  services/            External service and API boundaries
    api/               Future WordPress/API service layer
  theme/              Design tokens and centralized theme
  types/              Shared TypeScript types
```

UI components should not make direct WordPress/network calls. Phase 1 will add the real WordPress content services behind `src/services/api`.

Theme selection is centralized through `ThemeProvider` and follows the system light/dark preference. The token layer is intentionally small and designed to grow with later product screens.

Supabase is prepared as an optional client foundation; database schemas and authenticated user systems are deliberately deferred until their Phase 1+ requirements are defined.

## Phase 0 scope

Included:

- Expo + React Native foundation
- TypeScript
- Expo Router
- Initial TFN proof screen
- Centralized TFN design tokens
- Light/dark theme architecture
- Small reusable UI primitives
- Environment-variable strategy
- Supabase client boundary
- API/service boundary for future WordPress integration
- Basic validation commands

Not included yet:

- Final Home, Quick, Discover, Radar, or Profile experiences
- Personalization, search, notifications, saved content, networking, or intelligence systems
- Full WordPress integration
- TFN database schema
- Authentication flows

## Development workflow

Use the `phase-0/foundation` branch for this foundation work and keep `main` stable. Changes should be small, reviewable, and validated before merge. Phase-specific work should move through a reviewable pull request rather than direct, unstructured commits to `main`.

## Next phase

**PHASE 1 — TFN WEBSITE + WORDPRESS CONTENT ENGINE**

Do not begin Phase 1 automatically. First review and merge the completed Phase 0 foundation.
