import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { categoriesKeys, listServiceCategories } from "@/api/categories";

/** Service categories plus an id → name lookup for cards and headers. */
export default function useCategories() {
  const query = useQuery({
    queryKey: categoriesKeys.all,
    queryFn: listServiceCategories,
    staleTime: 1000 * 60 * 30,
  });

  const nameById = useMemo(
    () => new Map((query.data ?? []).map((category) => [category.id, category.name])),
    [query.data],
  );

  return { ...query, categories: query.data ?? [], nameById };
}
