# ADR-005: Optional Google capabilities without exposing server secrets

## Status

Accepted

## Date

2026-09-29

## Context

The personal travel site uses Places autocomplete and backend Routes, Geocoding and Weather calls. The initial open-source version retained only keyless external Maps URLs, losing those capabilities. A static GitHub Pages app cannot safely accept a server secret.

## Decision

Keep keyless Maps URLs as the default. Step 3 offers an optional, website-restricted Browser Key for Places autocomplete. This key is runtime-only unless the user explicitly selects “remember this device.” Add separately deployable, authenticated Firebase callable Functions for Routes, Geocoding and Weather; only those Functions receive `GOOGLE_MAPS_SERVER_KEY` from Firebase Secret Manager. The setup wizard checks whether Functions respond, but does not claim that loading Places or receiving a capabilities response proves API billing, restrictions or quotas are correct. Paid API requests happen only when users explicitly press a calculation button.

## Consequences

- Users without Google Cloud setup can still create trips and open keyless Maps links.
- Places requires the user's own Billing, Maps JavaScript API, Places API (New) and restricted Browser Key.
- Advanced calculations require the user's own Blaze project, Server Key, Functions deployment and budget limits.
- No personal Japan-only region filter, author domain or author key is embedded in the open-source app.
