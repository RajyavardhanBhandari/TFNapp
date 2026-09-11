# Phase 1 — TFN Content Pipeline Audit

## Verified from project/repository

- `TFNapp` is an Expo + Expo Router TypeScript application.
- The repository default branch is `main` and Phase 1 work is isolated on `phase-1/content-engine`.
- Current Phase 0 app surface is intentionally minimal: a root Expo Router layout and a simple index screen.
- Existing package scripts include Expo start commands, lint, and TypeScript typecheck.
- WordPress remains the planned editorial source of truth.
- The TFN website frontend repository is now accessible and is a static/custom-coded frontend. It does not expose the WordPress CMS implementation or a documented app API contract in the repository.
- The TFN WordPress/backend repositories transferred to the project owner are currently empty, so the WordPress installation remains the authoritative backend to inspect.

## Web/API investigation

The public TFN site is live and the project continues to target the WordPress REST API as the first app integration path. Direct runtime access to the TFN REST API from this execution environment is still not reliable, so API behavior that could not be directly observed is **not** treated as verified.

### Verified by implementation contract

The Phase 1 contract requires a WordPress REST integration with:
- published posts
- categories/taxonomies where supported
- embedded author/media data where supported
- WordPress pagination headers
- canonical post links

The current implementation uses the standard WordPress resources `posts`, `categories`, and `tags`, with `_embed=1` for author and featured-media data.

### Needs investigation / live verification

Before production release, verify against the live TFN installation:
- whether `/wp-json/wp/v2/posts` is publicly exposed
- actual custom post types
- custom taxonomies and TFN initiatives
- custom REST fields/endpoints
- exact author/media payloads
- whether article body HTML contains embeds or custom blocks requiring special handling
- exact category/tag coverage
- whether any WordPress security/CDN layer changes API behavior

## Current recommendation

Use a dedicated content service rather than calling WordPress directly from UI components. Normalize WordPress responses into small app-facing TypeScript models. Keep WordPress as the editorial source of truth and avoid duplicating articles in Supabase during Phase 1.

## Implemented foundation

- Normalized article, category, author, image and pagination types.
- Reusable WordPress request client with timeout and API error handling.
- Article and category retrieval methods.
- WordPress pagination metadata extraction.
- Embedded author and featured-media normalization.
- Lightweight 60-second in-memory content caching for article/category result sets.
- Minimal real-content verification screen at `/content-test` with loading, error, empty and retry states.

## Important limitation

The current implementation deliberately uses the standard WordPress `posts`, `categories`, and `tags` REST resources as the first integration path. It must be validated against the actual TFN API before declaring the audit complete. It should be extended only where the live TFN API demonstrates additional post types/taxonomies/custom fields.
