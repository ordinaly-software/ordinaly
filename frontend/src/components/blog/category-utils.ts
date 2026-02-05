import type { Category } from "./types";

const EXCLUDED_CATEGORY_KEYS = new Set(["noticias", "news", "destacado", "highlighted"]);

const normalizeValue = (value?: string | null) => (value ?? "").trim().toLowerCase();

export const isExcludedCategory = (category?: Category | null) => {
  if (!category) return false;
  const slug = normalizeValue(category.slug);
  const title = normalizeValue(category.title);
  return EXCLUDED_CATEGORY_KEYS.has(slug) || EXCLUDED_CATEGORY_KEYS.has(title);
};

export const filterVisibleCategories = (categories: Category[]) =>
  categories.filter((category) => !isExcludedCategory(category));
