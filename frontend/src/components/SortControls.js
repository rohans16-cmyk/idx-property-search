const SORT_OPTIONS = [
  { value: "", label: "Default (listing ID)" },
  { value: "L_SystemPrice", label: "Price" },
  { value: "ListingContractDate", label: "Date listed" },
  { value: "LM_Int2_3", label: "Square footage" },
  { value: "L_Keyword2", label: "Beds" },
];

export { SORT_OPTIONS };

export default function SortControls({
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange,
  disabled = false,
}) {
  return (
    <div className="sort-controls" role="group" aria-label="Sort properties">
      <label className="sort-controls__field">
        <span>Sort by</span>
        <select
          value={sortBy}
          onChange={(event) => onSortByChange(event.target.value)}
          disabled={disabled}
          aria-label="Sort by"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value || "default"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="sort-controls__field">
        <span>Order</span>
        <select
          value={sortOrder}
          onChange={(event) => onSortOrderChange(event.target.value)}
          disabled={disabled || !sortBy}
          aria-label="Sort order"
        >
          <option value="ASC">Low to high / oldest first</option>
          <option value="DESC">High to low / newest first</option>
        </select>
      </label>
    </div>
  );
}
