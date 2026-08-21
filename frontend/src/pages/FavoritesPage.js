import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPropertyDetail } from "../api/client";
import PropertyCard from "../components/PropertyCard";
import { useFavoritesContext } from "../hooks/FavoritesContext";

export default function FavoritesPage() {
  const { favoriteIds, favoritesCount, isFavorite, toggleFavorite } =
    useFavoritesContext();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadFavorites() {
      if (favoriteIds.length === 0) {
        setProperties([]);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const results = await Promise.all(
          favoriteIds.map(async (id) => {
            try {
              return await fetchPropertyDetail(id);
            } catch {
              return null;
            }
          })
        );

        if (cancelled) return;
        setProperties(results.filter(Boolean));
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load favorites");
          setProperties([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadFavorites();
    return () => {
      cancelled = true;
    };
  }, [favoriteIds]);

  // Keep the grid in sync when the user unfavorites from a card on this page.
  const visible = properties.filter((p) => isFavorite(p.L_ListingID));

  return (
    <main className="listings-page">
      <header className="listings-page__header">
        <h1>Favorites</h1>
        <p className="listings-page__count">
          {favoritesCount === 0
            ? "No saved properties yet"
            : `${favoritesCount} saved ${favoritesCount === 1 ? "property" : "properties"}`}
        </p>
      </header>

      {loading && <p className="listings-page__status">Loading favorites…</p>}

      {error && (
        <p className="listings-page__error" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && favoritesCount === 0 && (
        <p className="listings-page__empty" role="status">
          Heart listings on the{" "}
          <Link to="/">search page</Link> to save them here. Favorites persist
          across refreshes.
        </p>
      )}

      {!loading && !error && visible.length > 0 && (
        <section className="listings-grid">
          {visible.map((property) => (
            <PropertyCard
              key={property.L_ListingID}
              property={property}
              isFavorite={isFavorite(property.L_ListingID)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </section>
      )}
    </main>
  );
}
