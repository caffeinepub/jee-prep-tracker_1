# AIR PREP – Backend Persistence

## Current State
All user data is stored in browser `localStorage` under these keys:
- `jee_chapters` — syllabus progress (ClassMap: chapter done/notes/module/revisions/questions)
- `jee_daily_log` — timer daily hours log (Record<string, number>) and also DailyTracker log (Record<string, DayLog>)
- `jee_weekly_target` — weekly target hours (number)
- `jee_prep_start_date` — prep start date string
- `jee_daily_range` — daily tracker date range
- `jee_mission_goal` — mission JEE goal date
- `k3b_images` — K3B images array
- `k3b_notes` — K3B notes text
- `jee_timer_session` — live timer session state

Problem: `localStorage` is per-browser and can be cleared when the app draft expires, the user clears browser data, or closes the app. Data is not truly permanent.

## Requested Changes (Diff)

### Add
- Motoko backend actor with stable storage for all user data:
  - `saveAllData(json: Text) : async ()` — saves entire app state as a JSON blob per user identity
  - `loadAllData() : async ?Text` — returns the saved JSON blob for the current caller
- Frontend `usePersistentStorage` hook that:
  - On mount: loads data from backend and merges it into localStorage (backend is source of truth)
  - On every save: writes to localStorage (for instant reactivity) AND queues a backend sync
  - On `beforeunload` / visibility change: flushes pending sync to backend
  - Shows a small "Saving..." / "Saved" indicator
- The entire app state is serialized as a single JSON object keyed by the localStorage keys above

### Modify
- `useLocalStorage` hook — wrap it so every write also triggers the background sync queue
- App.tsx — add the sync provider wrapper and load data on startup

### Remove
- Nothing removed

## Implementation Plan
1. Backend: Motoko actor with `HashMap<Principal, Text>` in stable storage. Expose `saveAllData(json)` and `loadAllData()` methods.
2. Frontend hook `useBackendSync`: loads all data on mount, saves all data on changes with debounce (2s), also saves on `beforeunload` and `visibilitychange`.
3. App.tsx: wrap app in a provider that initializes data from backend before rendering.
4. All existing `useLocalStorage` calls remain unchanged — the sync layer reads/writes the same localStorage keys transparently.
