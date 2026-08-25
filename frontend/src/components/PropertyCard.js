import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { formatNumber, formatPrice } from "../utils/format";
import PropertyImageCarousel from "./PropertyImageCarousel";

function formatBedsBathsSqft(property) {
  const beds = property.L_Keyword2 ?? "—";
  const baths = property.LM_Dec_3 ?? "—";
  const sqft = formatNumber(property.LM_Int2_3) || "—";
  return `${beds} bd · ${baths} ba · ${sqft} sqft`;
}

export default function PropertyCard({
  property,
  isFavorite = false,
  onToggleFavorite,
}) {
  const listingId = property.L_ListingID || property.id;
  const location = [property.L_City, property.L_State]
    .filter(Boolean)
    .join(", ");

  function handleFavoriteClick(event) {
    event.preventDefault();
    event.stopPropagation();
    if (typeof onToggleFavorite === "function") {
      onToggleFavorite(listingId);
    }
  }

  return (
    <article className="property-card">
      <Link
        className="property-card__link"
        to={`/property/${encodeURIComponent(listingId)}`}
      >
        <div className="property-card__media">
          <PropertyImageCarousel
            photos={property.L_Photos}
            alt={property.L_Address || "Property"}
          />
          {typeof onToggleFavorite === "function" && (
            <button
              type="button"
              className={
                isFavorite
                  ? "property-card__favorite property-card__favorite--active"
                  : "property-card__favorite"
              }
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              aria-pressed={isFavorite}
              onClick={handleFavoriteClick}
            >
              {isFavorite ? "♥" : "♡"}
            </button>
          )}
        </div>
        <div className="property-card__body">
          <p className="property-card__price">
            {formatPrice(property.L_SystemPrice)}
          </p>
          <h2 className="property-card__address">
            {property.L_Address || "Address unavailable"}
          </h2>
          <p className="property-card__location">{location || "Location N/A"}</p>
          <p className="property-card__meta">{formatBedsBathsSqft(property)}</p>
        </div>
      </Link>
    </article>
  );
}

PropertyCard.propTypes = {
  property: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    L_ListingID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    L_Address: PropTypes.string,
    L_City: PropTypes.string,
    L_State: PropTypes.string,
    L_SystemPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    L_Keyword2: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    LM_Dec_3: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    LM_Int2_3: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    L_Photos: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),
  }).isRequired,
  isFavorite: PropTypes.bool,
  onToggleFavorite: PropTypes.func,
};
