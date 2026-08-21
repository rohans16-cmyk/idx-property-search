import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "idx-property-favorites";

function readStoredFavorites() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((id) => String(id))
      .filter((id) => id.length > 0);
  } catch {
    return [];
  }
}

function writeStoredFavorites(ids) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

/**
 * Persist favorite listing IDs in localStorage.
 * Components must use this hook — do not call localStorage inline.
 */
export default function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState(() =>
    typeof window === "undefined" ? [] : readStoredFavorites()
  );

  useEffect(() => {
    writeStoredFavorites(favoriteIds);
  }, [favoriteIds]);

  const isFavorite = useCallback(
    (listingId) => {
      if (listingId == null || listingId === "") return false;
      return favoriteIds.includes(String(listingId));
    },
    [favoriteIds]
  );

  const toggleFavorite = useCallback((listingId) => {
    if (listingId == null || listingId === "") return;
    const id = String(listingId);
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const removeFavorite = useCallback((listingId) => {
    if (listingId == null || listingId === "") return;
    const id = String(listingId);
    setFavoriteIds((prev) => prev.filter((x) => x !== id));
  }, []);

  const clearFavorites = useCallback(() => {
    setFavoriteIds([]);
  }, []);

  return {
    favoriteIds,
    favoritesCount: favoriteIds.length,
    isFavorite,
    toggleFavorite,
    removeFavorite,
    clearFavorites,
  };
}

export { STORAGE_KEY, readStoredFavorites };
