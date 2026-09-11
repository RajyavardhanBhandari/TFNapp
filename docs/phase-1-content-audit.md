# Phase 1 — TFN Content Pipeline Audit

## Verified from project/repository

- `TFNapp` is an Expo + Expo Router TypeScript application.
- The repository default branch is `main` and Phase 1 work is isolated on `phase-1/content-engine`.
- WordPress is the actual TFN editorial CMS/backend and remains the source of truth.
- The accessible TFN frontend repository is a custom/static frontend; it does not contain the WordPress CMS implementation or a documented app API contract.
- The transferred `thefoundernation-backend` and `thefoundernation-admin` GitHub repositories are currently empty and are therefore not treated as the WordPress implementation.

## App content architecture implemented

`TFN Website → WordPress → WordPress REST API → TFN content service → Mobile app`

The app uses a dedicated WordPress content service rather than making API calls from UI components. Normalized app models cover articles, categories, authors, images and pagination. The service includes timeout/error handling and a lightweight 60-second in-memory cache. No editorial article mirror was added to Supabase in Phase 1.

The current service supports:
- published WordPress posts
- categories and tags
- embedded author data
- embedded featured-media data
- WordPress pagination headers
- canonical post links
- article lookup by WordPress ID
- article lookup by WordPress slug
- WordPress REST capability discovery for post types and taxonomies

## Live API verification

A live REST verification was attempted against the TFN WordPress installation. The execution environment did not return a reliable response from the live REST endpoints, so exact live payload behavior is **not** declared verified from runtime evidence.

The implementation therefore uses the standard WordPress REST resources as the initial integration path and includes capability discovery so that the live installation can be audited without inventing custom endpoints.

### Needs live verification

- exact `/wp-json/wp/v2` availability and response from the production TFN domain
- actual TFN post types exposed through REST
- actual TFN custom taxonomies and initiative mappings
- custom REST fields/endpoints, if any
- exact author/media payloads
- article body HTML blocks/embeds and any rendering requirements
- exact category/tag coverage
- pagination header behavior through the production CDN/security layer

## Real-content verification screen

`/content-test` loads through the same content service used by the app and displays:
- real article title/excerpt
- category
- author
- publication date
- featured image
- WordPress capability counts
- loading, error, empty and retry states

This is an engineering verification surface only. It is not the final Home experience and should not be carried into later product UI without purpose.

## Phase 1 scope boundary

Not implemented in this phase: final Home, navigation, Quick, Search, accounts, personalization, recommendation engine, Radar, notifications, Saved, sharing, Trending, funding/business features, ads, TFN Intelligence, podcast/video, or networking.

## Security

No CMS credentials, API secrets, private keys or sensitive environment values are stored in the repository.
