/**
 * Build the page control list for pagination UI.
 *
 * Returns numbers and the sentinel "ellipsis".
 * Handles: few pages (no ellipsis), near start, near end, and middle.
 *
 * Near-end correctness matters: never append totalPages if it is already
 * in the sliding window (that bug renders e.g. "1 … 8 9 10 … 10").
 */
export function getPageItems(currentPage, totalPages) {
  if (totalPages <= 0) return [];
  if (totalPages === 1) return [1];

  const current = Math.min(Math.max(1, currentPage), totalPages);

  // Enough room to show every page without ellipsis.
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const nearStart = current <= 3;
  const nearEnd = current >= totalPages - 2;

  if (nearStart) {
    return [1, 2, 3, 4, 5, "ellipsis", totalPages];
  }

  if (nearEnd) {
    return [
      1,
      "ellipsis",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  // Middle: first … neighbors … last (neighbors do not include 1 or last).
  return [
    1,
    "ellipsis",
    current - 1,
    current,
    current + 1,
    "ellipsis",
    totalPages,
  ];
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
}) {
  if (totalPages <= 1) return null;

  const items = getPageItems(currentPage, totalPages);
  const isFirst = currentPage <= 1;
  const isLast = currentPage >= totalPages;

  function goTo(page) {
    if (disabled) return;
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
  }

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        type="button"
        className="pagination__btn"
        onClick={() => goTo(currentPage - 1)}
        disabled={disabled || isFirst}
        aria-label="Previous page"
      >
        Previous
      </button>

      <ul className="pagination__pages">
        {items.map((item, index) => {
          if (item === "ellipsis") {
            return (
              <li key={`ellipsis-${index}`} className="pagination__ellipsis">
                <span aria-hidden="true">…</span>
              </li>
            );
          }

          const page = item;
          const active = page === currentPage;
          return (
            <li key={page}>
              <button
                type="button"
                className={
                  active
                    ? "pagination__page pagination__page--active"
                    : "pagination__page"
                }
                onClick={() => goTo(page)}
                disabled={disabled}
                aria-label={`Page ${page}`}
                aria-current={active ? "page" : undefined}
              >
                {page}
              </button>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        className="pagination__btn"
        onClick={() => goTo(currentPage + 1)}
        disabled={disabled || isLast}
        aria-label="Next page"
      >
        Next
      </button>
    </nav>
  );
}
