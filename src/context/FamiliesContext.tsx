import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { loadFamiliesRecord, type FamilyUi } from '../lib/platformFamilies';

type FamiliesContextValue = {
  families: Record<string, FamilyUi>;
  loading: boolean;
};

const FamiliesContext = createContext<FamiliesContextValue>({ families: {}, loading: true });

export function FamiliesProvider({ children }: { children: ReactNode }) {
  const [families, setFamilies] = useState<Record<string, FamilyUi>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const record = await loadFamiliesRecord();
      if (!cancelled) {
        setFamilies(record);
        setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => ({ families, loading }), [families, loading]);

  return <FamiliesContext.Provider value={value}>{children}</FamiliesContext.Provider>;
}

export function useFamilies(): FamiliesContextValue {
  return useContext(FamiliesContext);
}

/** Badge-safe family meta when id is missing from DB (should be rare). */
export function defaultFamilyBadge(): FamilyUi {
  return {
    name: 'Platform',
    tagline: '',
    color: '#64748B',
    bg: '#64748B14',
    longDesc: '',
    useCases: [],
    dependsOn: [],
    enables: [],
    solutions: [],
  };
}
