import { useCallback, useEffect, useRef, useState } from "react";
import { fetchProperties } from "../api/client";
import PropertyCard from "../components/PropertyCard";
import PropertyFilters, { EMPTY_FILTERS } from "../components/PropertyFilters";
import Pagination from "../components/Pagination";

const DEFAULT_ITEMS_PER_PAGE = 20;

export default function ListingsPage() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);
  const [data, setData] = useState({ total: 0, results: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Monotonic request id: only the latest in-flight fetch may update UI.
  const requestIdRef = useRef(0);

  const loadProperties = useCallback(async (nextFilters, page, pageSize) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    const offset = (page - 1) * pageSize;

    try {
      const response = await fetchProperties({
        ...nextFilters,
        limit: pageSize,
        offset,
      });

      if (requestId !== requestIdRef.current) return;

      setData({
        total: response.total ?? 0,
        results: Array.isArray(response.results) ? response.results : [],
      });
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err.message || "Failed to load properties");
      setData({ total: 0, results: [] });
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadProperties({}, 1, itemsPerPage);
  }, [loadProperties, itemsPerPage]);

  function handleSearch(sanitized) {
    setAppliedFilters(sanitized);
    setCurrentPage(1); // filters reset pagination to page 1
    loadProperties(sanitized, 1, itemsPerPage);
  }

  function handleClear() {
    setFilters(EMPTY_FILTERS);
    setAppliedFilters({});
    setCurrentPage(1);
    loadProperties({}, 1, itemsPerPage);
  }

  function handlePageChange(page) {
    setCurrentPage(page);
    loadProperties(appliedFilters, page, itemsPerPage);
    window.scrollTo(0, 0);
  }

  const shown = data.results.length;
  const hasActiveFilters = Object.keys(appliedFilters).length > 0;
  const rangeStart = shown === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const rangeEnd = shown === 0 ? 0 : rangeStart + shown - 1;
  const pageCount = Math.ceil(data.total / itemsPerPage);

  return (
    <main className="listings-page">
      <header className="listings-page__header">
        <h1>Property Listings</h1>
        {!loading && !error && (
          <p className="listings-page__count">
            {shown === 0
              ? `Showing 0 of ${data.total.toLocaleString("en-US")} properties`
              : `Showing ${rangeStart.toLocaleString("en-US")}-${rangeEnd.toLocaleString("en-US")} of ${data.total.toLocaleString("en-US")} properties`}
            {hasActiveFilters ? " (filtered)" : ""}
          </p>
        )}
      </header>

      <PropertyFilters
        filters={filters}
        onChange={setFilters}
        onSearch={handleSearch}
        onClear={handleClear}
      />

      {loading && <p className="listings-page__status">Loading properties…</p>}

      {error && (
        <p className="listings-page__error" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && shown === 0 && (
        <p className="listings-page__empty" role="status">
          No properties found
          {hasActiveFilters
            ? " matching your filters. Try clearing filters or adjusting your search."
            : "."}
        </p>
      )}

      {!loading && !error && shown > 0 && (
        <>
          <section className="listings-grid">
            {data.results.map((property) => (
              <PropertyCard
                key={property.L_ListingID || property.id}
                property={property}
              />
            ))}
          </section>

          <Pagination
            currentPage={currentPage}
            totalPages={pageCount}
            onPageChange={handlePageChange}
            disabled={loading}
          />
        </>
      )}
    </main>
  );
}
