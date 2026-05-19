# `src/i18n/`

Internationalization configuration and translation messages.

## What belongs here

- i18n library configuration (introduced in **Phase 42**)
- Translation catalogs (English baseline + later Hindi / Hinglish in Phase 43)
- Locale detection helpers and a `useLocale()` hook (in `src/hooks/`)

## What does NOT belong here

- Hardcoded user-facing strings scattered across components
- Language-pack content that hasn't been reviewed by a native speaker (no machine-translated placeholder strings)

## Phase status

Reserved. No translations exist yet. **Do not add language packs in Phase 4.** Empty by design.
