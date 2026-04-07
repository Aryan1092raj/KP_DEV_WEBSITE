import { startTransition, useEffect, useRef, useState, useDeferredValue } from "react";

export function useFetch(fetcher, dependencies = []) {
  const fetcherRef = useRef(fetcher);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const deferredReloadKey = useDeferredValue(reloadKey);

  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  useEffect(() => {
    let active = true;

    async function run() {
      setLoading(true);
      setError("");

      try {
        const result = await fetcherRef.current();
        if (!active) {
          return;
        }
        startTransition(() => setData(result));
      } catch (requestError) {
        if (!active) {
          return;
        }
        setError(requestError.message || "Unable to load data.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    run();

    return () => {
      active = false;
    };
  }, [...dependencies, deferredReloadKey]);

  return {
    data,
    error,
    loading,
    refetch: () => setReloadKey((value) => value + 1),
  };
}
