const EMPTY_FILTERS = {
  city: "",
  zipcode: "",
  minPrice: "",
  maxPrice: "",
  beds: "",
  baths: "",
};

const BED_OPTIONS = ["1", "2", "3", "4", "5", "6+"];
const BATH_OPTIONS = ["1", "2", "3", "4", "5", "6+"];

/**
 * Strip empty values and map UI choices onto API params.
 * Exact 1–5 → beds/baths; "6+" → minBeds/minBaths (>= 6 on the backend).
 */
export function sanitizeFilters(filters) {
  const next = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (value === "" || value == null) return;

    if (key === "beds") {
      if (value === "6+") next.minBeds = 6;
      else next.beds = value;
      return;
    }

    if (key === "baths") {
      if (value === "6+") next.minBaths = 6;
      else next.baths = value;
      return;
    }

    next[key] = value;
  });

  return next;
}

export { EMPTY_FILTERS };

export default function PropertyFilters({
  filters,
  onChange,
  onSearch,
  onClear,
  disabled = false,
}) {
  function handleFieldChange(event) {
    const { name, value } = event.target;
    onChange({ ...filters, [name]: value });
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSearch(sanitizeFilters(filters));
  }

  function handleClear(event) {
    event.preventDefault();
    onClear();
  }

  return (
    <form className="property-filters" onSubmit={handleSubmit} noValidate>
      <div className="property-filters__grid">
        <label className="property-filters__field">
          <span>City</span>
          <input
            type="text"
            name="city"
            value={filters.city}
            onChange={handleFieldChange}
            placeholder="e.g. Austin"
            disabled={disabled}
            aria-label="City"
          />
        </label>

        <label className="property-filters__field">
          <span>ZIP code</span>
          <input
            type="text"
            name="zipcode"
            value={filters.zipcode}
            onChange={handleFieldChange}
            placeholder="e.g. 78701"
            disabled={disabled}
            aria-label="ZIP code"
            inputMode="numeric"
          />
        </label>

        <label className="property-filters__field">
          <span>Min price</span>
          <input
            type="number"
            name="minPrice"
            value={filters.minPrice}
            onChange={handleFieldChange}
            placeholder="0"
            min="0"
            disabled={disabled}
            aria-label="Min price"
          />
        </label>

        <label className="property-filters__field">
          <span>Max price</span>
          <input
            type="number"
            name="maxPrice"
            value={filters.maxPrice}
            onChange={handleFieldChange}
            placeholder="Any"
            min="0"
            disabled={disabled}
            aria-label="Max price"
          />
        </label>

        <label className="property-filters__field">
          <span>Beds</span>
          <select
            name="beds"
            value={filters.beds}
            onChange={handleFieldChange}
            disabled={disabled}
            aria-label="Beds"
          >
            <option value="">Any</option>
            {BED_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>

        <label className="property-filters__field">
          <span>Baths</span>
          <select
            name="baths"
            value={filters.baths}
            onChange={handleFieldChange}
            disabled={disabled}
            aria-label="Baths"
          >
            <option value="">Any</option>
            {BATH_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="property-filters__actions">
        <button type="submit" className="property-filters__search" disabled={disabled}>
          Search
        </button>
        <button
          type="button"
          className="property-filters__clear"
          onClick={handleClear}
          disabled={disabled}
        >
          Clear Filters
        </button>
      </div>
    </form>
  );
}
