import { useEffect, useState } from "react";
import { fetchProperties } from "../api/client";
import PropertyCard from "../components/PropertyCard";

const DEFAULT_LIMIT = 20;

export default function ListingsPage() {
  const [data, setData] = useState({ total: 0, results: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchProperties({
          limit: DEFAULT_LIMIT,
          offset: 0,
        });
        if (!cancelled) {
          setData({
            total: response.total ?? 0,
            results: Array.isArray(response.results) ? response.results : [],
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load properties");
          setData({ total: 0, results: [] });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const shown = data.results.length;

  return (
    <main className="listings-page">
      <header className="listings-page__header">
        <h1>Property Listings</h1>
        {!loading && !error && (
          <p className="listings-page__count">
            Showing {shown} of {data.total.toLocaleString("en-US")} properties
          </p>
        )}
      </header>

      {loading && <p className="listings-page__status">Loading properties…</p>}

      {error && (
        <p className="listings-page__error" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && (
        <section className="listings-grid">
          {data.results.map((property) => (
            <PropertyCard
              key={property.L_ListingID || property.id}
              property={property}
            />
          ))}
        </section>
      )}
    </main>
  );
}
