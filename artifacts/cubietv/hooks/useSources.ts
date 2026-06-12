import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

export interface Source {
  id: string;
  name: string;
  type: "smb" | "dlna";
  address: string;
  shareName: string;
  username?: string;
  password?: string;
}

const STORAGE_KEY = "@cubietv:sources";

export function useSources() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((json) => { if (json) setSources(JSON.parse(json)); })
      .finally(() => setLoading(false));
  }, []);

  const persist = useCallback(async (next: Source[]) => {
    setSources(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const addSource = useCallback(
    async (s: Omit<Source, "id">) => persist([...sources, { ...s, id: Date.now().toString() }]),
    [sources, persist]
  );

  const removeSource = useCallback(
    async (id: string) => persist(sources.filter((s) => s.id !== id)),
    [sources, persist]
  );

  const updateSource = useCallback(
    async (id: string, patch: Partial<Omit<Source, "id">>) =>
      persist(sources.map((s) => (s.id === id ? { ...s, ...patch } : s))),
    [sources, persist]
  );

  return { sources, loading, addSource, removeSource, updateSource };
}
