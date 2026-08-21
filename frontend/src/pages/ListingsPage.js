import { useCallback, useEffect, useRef, useState } from "react";
import { fetchProperties } from "../api/client";
import PropertyCard from "../components/PropertyCard";
import PropertyFilters, { EMPTY_FILTERS } from "../components/PropertyFilters";
import Pagination from "../components/Pagination";
import SortControls from "../components/SortControls";
import { useFavoritesContext } from "../hooks/FavoritesContext";

const DEFAULT_ITEMS_PER_PAGE = 20;
const DEFAULT_SORT = { sortBy: "", sortOrder: "ASC" };

export default function ListingsPage() {
  const { isFavorite, toggleFavorite } = useFavoritesContext();
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [sort, setSort] = useState(DEFAULT_SORT);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);
  const [data, setData] = useState({ total: 0, results: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Monotonic request id: only the latest in-flight fetch may update UI.
  const requestIdRef = useRef(0);

  const loadProperties = useCallback(async (nextFilters, page, pageSize, nextSort) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    const offset = (page - 1) * pageSize;
    const params = {
      ...nextFilters,
      limit: pageSize,
      offset,
    };

    if (nextSort?.sortBy) {
      params.sortBy = nextSort.sortBy;
      params.sortOrder = nextSort.sortOrder || "ASC";
    }

    try {
      const response = await fetchProperties(params);

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
    loadProperties({}, 1, itemsPerPage, DEFAULT_SORT);
  }, [loadProperties, itemsPerPage]);

  function handleSearch(sanitized) {
    // Spec: sort resets when filters change; pagination goes to page 1.
    const resetSort = DEFAULT_SORT;
    setAppliedFilters(sanitized);
    setSort(resetSort);
    setCurrentPage(1);
    loadProperties(sanitized, 1, itemsPerPage, resetSort);
  }

  function handleClear() {
    const resetSort = DEFAULT_SORT;
    setFilters(EMPTY_FILTERS);
    setAppliedFilters({});
    setSort(resetSort);
    setCurrentPage(1);
    loadProperties({}, 1, itemsPerPage, resetSort);
  }

  function handlePageChange(page) {
    // Spec: sort persists across page changes.
    setCurrentPage(page);
    loadProperties(appliedFilters, page, itemsPerPage, sort);
    window.scrollTo(0, 0);
  }

  function handleSortByChange(sortBy) {
    const nextSort = {
      sortBy,
      sortOrder: sortBy ? sort.sortOrder || "ASC" : "ASC",
    };
    setSort(nextSort);
    setCurrentPage(1);
    loadProperties(appliedFilters, 1, itemsPerPage, nextSort);
  }

  function handleSortOrderChange(sortOrder) {
    const nextSort = { ...sort, sortOrder };
    setSort(nextSort);
    setCurrentPage(1);
    loadProperties(appliedFilters, 1, itemsPerPage, nextSort);
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

      <SortControls
        sortBy={sort.sortBy}
        sortOrder={sort.sortOrder}
        onSortByChange={handleSortByChange}
        onSortOrderChange={handleSortOrderChange}
        disabled={loading}
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
                isFavorite={isFavorite(property.L_ListingID || property.id)}
                onToggleFavorite={toggleFavorite}
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
