import { supabase } from "@/lib/supabase";
import { Category } from "@/models/Category";
import { throwIfError } from "./common";

export const categoriesKeys = {
  all: ["categories"] as const,
};

export async function listServiceCategories() {
  const { data, error } = await supabase
    .from("service_category")
    .select("*")
    .order("name", { ascending: true });

  throwIfError(error);

  return (data ?? []) as Category[];
}
