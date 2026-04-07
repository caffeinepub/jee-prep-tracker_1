import { useCallback, useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValueRaw] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // Sync from localStorage whenever the key changes or the component remounts
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        setStoredValueRaw(JSON.parse(item) as T);
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Re-read from localStorage when backend sync restores data
  useEffect(() => {
    const handleRestore = () => {
      try {
        const item = window.localStorage.getItem(key);
        if (item !== null) {
          setStoredValueRaw(JSON.parse(item) as T);
        }
      } catch {
        // ignore
      }
    };
    window.addEventListener("storage-restored", handleRestore);
    return () => window.removeEventListener("storage-restored", handleRestore);
  }, [key]);

  const setStoredValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValueRaw((prev) => {
        const next =
          typeof value === "function" ? (value as (prev: T) => T)(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    },
    [key],
  );

  return [storedValue, setStoredValue] as const;
}
