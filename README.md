# TFN App

The Founder Nation mobile application.

## Direction

- React Native + Expo
- TypeScript
- Expo Router
- Supabase for application data/services
- WordPress remains the editorial CMS
- WordPress content flows automatically into the app through an API layer
- Browser preview is a first-class development workflow

## Product principles

1. Startup ecosystem first.
2. Mobile-native, not a website wrapper.
3. Fast and easy to consume.
4. Personalization improves over time.
5. No duplicate editorial workflow.
6. Simple V1 systems with an architecture that can evolve into TFN Intelligence.
7. Privacy and transparency are product requirements.

## Current status

Phase 0 foundation initialized. WordPress API integration belongs to Phase 1 and should begin only after inspecting the live WordPress REST API, taxonomies, media, authors, custom post types, custom fields, and relevant API extensions.

## Local development

Install dependencies with your preferred package manager, then run:

```bash
npm install
npm run web
```

For native development:

```bash
npm run ios
npm run android
```

## Architecture notes

The app should preserve a separation between:

- `content`: WordPress-sourced editorial content
- `entities`: companies, founders, investors, topics and sectors
- `user`: account/profile/preferences
- `signals`: recommendation and engagement events
- `features`: product capabilities such as Radar, Saved and Notifications

This separation is intentional so future recommendation and intelligence capabilities do not require rebuilding the content layer.
