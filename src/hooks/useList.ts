import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { TablesMap } from "@/utils/collections";
import { useMemo, useState } from "react";

export type ListOptions = {
  select?: string;
  filter?: Record<string, unknown>;
  filterRaw?: string; // For complex filters using PostgREST syntax
  order?: { column: string; ascending?: boolean };
  notRefreshOnFocus?: boolean;
  cacheTime?: number;
  ilike?: { column: string; value: string };
  or?: string; // PostgREST OR filter
};

export default function useList<K extends keyof TablesMap>(
  collection: K,
  initialOptions?: ListOptions
) {
  const [opts, setOpts] = useState(initialOptions);

  const fetchData = async () => {
    let query = supabase.from(collection).select(opts?.select || "*");

    // Apply equality filters
    if (opts?.filter) {
      for (const [key, value] of Object.entries(opts.filter)) {
        query = query.eq(key, value);
      }
    }

    // Apply ilike filter (search)
    if (opts?.ilike) {
      query = query.ilike(opts.ilike.column, opts.ilike.value);
    }

    // Apply OR filter
    if (opts?.or) {
      query = query.or(opts.or);
    }

    // Apply ordering
    if (opts?.order) {
      query = query.order(opts.order.column, {
        ascending: opts.order.ascending ?? true,
      });
    }

    const { data, error } = await query;

    if (error) throw new Error(error.message);

    return (data || []) as TablesMap[K][];
  };

  const { data, status, error, isRefetching } = useQuery({
    queryKey: [collection, opts],
    queryFn: fetchData,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: !opts?.notRefreshOnFocus,
    refetchOnReconnect: true,
    retry: 2,
    gcTime: opts?.cacheTime ?? 1000 * 60 * 3,
  });

  const queryStatus = useMemo(
    () => (status === "pending" || isRefetching ? "loading" : status),
    [status, isRefetching]
  );

  const updateOptions = (newOptions?: ListOptions) => {
    setOpts((prev) => ({ ...prev, ...newOptions }));
  };

  return [data ?? [], { status: queryStatus, error }, updateOptions] as const;
}
