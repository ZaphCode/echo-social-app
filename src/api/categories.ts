import { supabase } from "@/lib/supabase";
import { Category } from "@/models/Category";
import { throwIfError } from "./common";
import { getOfflineNetworkState } from "@/offline/network";
import { isLikelyNetworkError } from "@/offline/network";
import { cacheCategories, listCachedCategories } from "@/offline/store";

export const categoriesKeys = {
  all: ["categories"] as const,
};

export async function listServiceCategories() {
  if (!getOfflineNetworkState()) {
    return listCachedCategories();
  }

  try {
    const { data, error } = await supabase
      .from("service_category")
      .select("*")
      .order("name", { ascending: true });

    throwIfError(error);

    const categories = (data ?? []) as Category[];
    await cacheCategories(categories);

    return categories;
  } catch (error) {
    if (isLikelyNetworkError(error)) {
      return listCachedCategories();
    }

    throw error;
  }
}
