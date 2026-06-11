# CubieTV

A Netflix-style home media player UI built in React Native (Expo), designed to browse a home NAS and play videos. This is the UI scaffold — no actual VLC/SMB/DLNA networking yet.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/cubietv run dev` — run the Expo mobile app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo + React Native (expo-router)
- API: Express 5
- DB: PostgreSQL + Drizzle ORM (not yet used in mobile)
- Build: esbuild (API CJS bundle)

## Where things live

- `artifacts/cubietv/` — Expo mobile app (all screens, components, fake data)
- `artifacts/cubietv/app/` — expo-router screens
- `artifacts/cubietv/components/` — shared UI components
- `artifacts/cubietv/data/fakeData.ts` — 20 fake MediaItem records
- `artifacts/cubietv/constants/colors.ts` — dark TV theme palette
- `artifacts/api-server/src/` — Express API server (currently health-check only)

## Architecture decisions

- UI-only scaffold: all media data is fake (`data/fakeData.ts`). Real SMB/DLNA/VLC integration to be added later.
- Expo (React Native) instead of native Kotlin/Compose for TV — builds on Replit, runs on iOS/Android/web via Expo Go.
- Dark-first design: `#0F0F0F` background, `#E50914` Netflix-red primary. All colors in `constants/colors.ts`.
- No tab bar: full-screen stack navigation (splash → library → detail/player/search/settings/source-setup/discovery).
- Platform-aware animations: `useNativeDriver: Platform.OS !== 'web'` on all Animated calls to avoid web warnings.

## Product

8 fully-wired screens:
1. **Splash** — animated logo + loading bar → auto-navigates to Library
2. **Library** — hero carousel (auto-cycles 6s), Continue Watching row (16:9 with progress bars), Movies/Shows/Recently Added rows
3. **Detail** — backdrop, poster, metadata, Play/Watchlist/Watched buttons, "More Like This" row
4. **Player** — black surface, overlay with seek bar + transport controls (auto-hides 4s, tap to show)
5. **Search** — on-screen D-pad keyboard, real-time filter against 20 fake items
6. **Settings** — source management, HW/SW decode toggle, caching slider, audio/subtitle dropdowns
7. **Source Setup** — SMB/DLNA form with fake "Scan Network" (2s delay, 3 fake results) and "Test Connection"
8. **Discovery** — animated network scan → 3 discovered fake servers

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Do NOT add `useNativeDriver: true` to Animated calls that drive non-layout properties on web — use `Platform.OS !== 'web'` check.
- `app/(tabs)/_layout.tsx` is a plain `<Slot />` — the tab bar has been removed; all navigation is Stack-based.
- The `(tabs)/index.tsx` file is the splash screen (entry route `/`). Library and other screens are siblings at `app/`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See the `expo` skill for mobile development guidelines
