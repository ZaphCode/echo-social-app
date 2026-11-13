import { ImageSourcePropType } from "react-native";

/**
 * Photos for the category carousel on Inicio.
 *
 * Edit freely: each value can be a remote URL (string) or a local asset
 * (`require("@Assets/categories/plomeria.jpg")`). Keys are the category name
 * as stored in `service_category`; accents and capitals don't matter.
 * A category without an entry shows a plain tile with its initial.
 */
const unsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=360&h=480&fit=crop&q=70`;

export const CATEGORY_IMAGES: Record<string, string | ImageSourcePropType> = {
  todas: unsplash("1625241152315-4a698f74ceb7"),
  plomeria: unsplash("1567769462911-520a38352744"),
  electricista: unsplash("1758101755915-462eddc23f57"),
  carpinteria: unsplash("1659930087003-2d64e33181f7"),
  pintura: unsplash("1562259949-e8e7689d7828"),
  jardineria: unsplash("1689728318937-17d24bc0a65c"),
  "instalacion de aires acondicionados": unsplash("1757219525975-03b5984bc6e8"),
  "instalacion de pisos": unsplash("1523413363574-c30aa1c2a516"),
  "limpieza de banos": unsplash("1661107259637-4e1c55462428"),
  // Temporales: reemplázalas por fotos propias de cada categoría.
  albanileria: unsplash("1701850009190-2859ba2aeea6"),
  "limpieza de casas y oficinas": unsplash("1713110824336-f78c320dcf8e"),
  "limpieza de fosas y biodigestores": unsplash("1662445407335-db6b4e68c323"),
};

export function normalizeCategoryName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}

export function getCategoryImage(name: string) {
  const image = CATEGORY_IMAGES[normalizeCategoryName(name)];
  if (!image) return undefined;
  return typeof image === "string" ? { uri: image } : image;
}
