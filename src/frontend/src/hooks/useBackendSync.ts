import { useCallback, useEffect, useRef, useState } from "react";
import { useActor } from "./useActor";

export type SyncStatus = "loading" | "synced" | "saving" | "error" | "idle";

const SYNC_KEYS = [
  "jee_chapters",
  "jee_daily_log",
  "jee_tracker_log",
  "jee_weekly_target",
  "jee_prep_start_date",
  "jee_daily_range",
  "jee_mission_goal",
  "k3b_images",
  "k3b_notes",
  "jee_timer_session",
] as const;

// How long to wait after a change before saving (debounce)
const DEBOUNCE_MS = 1500;
// How often to check localStorage for changes
const POLL_INTERVAL_MS = 3000;
// How long to show "synced" badge before hiding
const SYNCED_DISPLAY_MS = 3000;

function snapshotLocalStorage(): Record<string, string | null> {
  const snapshot: Record<string, string | null> = {};
  for (const key of SYNC_KEYS) {
    snapshot[key] = localStorage.getItem(key);
  }
  return snapshot;
}

function serializeSnapshot(snapshot: Record<string, string | null>): string {
  // Build the object with parsed values (so we store clean JSON, not double-encoded)
  const data: Record<string, unknown> = {};
  for (const key of SYNC_KEYS) {
    const raw = snapshot[key];
    if (raw !== null) {
      try {
        data[key] = JSON.parse(raw);
      } catch {
        data[key] = raw;
      }
    }
  }
  return JSON.stringify(data);
}

function restoreSnapshot(json: string): void {
  try {
    const data = JSON.parse(json) as Record<string, unknown>;
    for (const key of SYNC_KEYS) {
      if (key in data && data[key] !== undefined && data[key] !== null) {
        localStorage.setItem(key, JSON.stringify(data[key]));
      }
    }
  } catch {
    // ignore malformed data
  }
}

export function useBackendSync() {
  const { actor, isFetching } = useActor();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");

  // Track the last snapshot we saved to detect real changes
  const lastSavedSnapshotRef = useRef<string>("");
  // Debounce timer ref
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Whether initial load from backend is done
  const initialLoadDoneRef = useRef(false);
  // Whether actor is available
  const actorRef = useRef(actor);
  actorRef.current = actor;
  // Track synced hide timer
  const syncedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showSynced = useCallback(() => {
    setSyncStatus("synced");
    if (syncedTimerRef.current) clearTimeout(syncedTimerRef.current);
    syncedTimerRef.current = setTimeout(() => {
      setSyncStatus("idle");
    }, SYNCED_DISPLAY_MS);
  }, []);

  const saveToBackend = useCallback(
    async (force = false) => {
      const currentActor = actorRef.current;
      if (!currentActor) return;

      const snapshot = snapshotLocalStorage();
      const serialized = serializeSnapshot(snapshot);

      // Skip if nothing changed and not forced
      if (!force && serialized === lastSavedSnapshotRef.current) return;

      try {
        setSyncStatus("saving");
        await currentActor.saveAllData(serialized);
        lastSavedSnapshotRef.current = serialized;
        showSynced();
      } catch {
        setSyncStatus("error");
      }
    },
    [showSynced],
  );

  const scheduleSave = useCallback(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      saveToBackend();
    }, DEBOUNCE_MS);
  }, [saveToBackend]);

  // Initial load from backend — run once when actor is ready
  useEffect(() => {
    if (!actor || isFetching || initialLoadDoneRef.current) return;
    initialLoadDoneRef.current = true;

    (async () => {
      setSyncStatus("loading");
      try {
        const json = await actor.loadAllData();
        if (json) {
          // Restore data to localStorage FIRST
          restoreSnapshot(json);
          // Dispatch event so all useLocalStorage hooks re-read their values
          window.dispatchEvent(new Event("storage-restored"));
          // Set the baseline AFTER restoring, using the restored data as source of truth
          // This prevents the polling loop from immediately trying to overwrite with stale data
          lastSavedSnapshotRef.current = json;
        } else {
          // No data on backend yet — take current localStorage as baseline
          const snapshot = snapshotLocalStorage();
          lastSavedSnapshotRef.current = serializeSnapshot(snapshot);
        }
        showSynced();
      } catch {
        setSyncStatus("error");
        // Even on error, set baseline so polling can still detect future changes
        const snapshot = snapshotLocalStorage();
        lastSavedSnapshotRef.current = serializeSnapshot(snapshot);
      }
    })();
  }, [actor, isFetching, showSynced]);

  // Poll localStorage for changes every POLL_INTERVAL_MS
  useEffect(() => {
    const interval = setInterval(() => {
      if (!actorRef.current || !initialLoadDoneRef.current) return;
      const snapshot = snapshotLocalStorage();
      const serialized = serializeSnapshot(snapshot);
      if (serialized !== lastSavedSnapshotRef.current) {
        scheduleSave();
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [scheduleSave]);

  // Save immediately on tab hide / page close
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // Cancel any pending debounce and save now
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        saveToBackend(true);
      }
    };

    const handleBeforeUnload = () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      saveToBackend(true);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [saveToBackend]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (syncedTimerRef.current) clearTimeout(syncedTimerRef.current);
    };
  }, []);

  return { syncStatus };
}
