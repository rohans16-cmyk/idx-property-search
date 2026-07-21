import { useState } from "react";
import { getPrimaryPhotoUrl } from "../utils/photos";

function formatPrice(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "Price N/A";
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function formatBedsBathsSqft(property) {
  const beds = property.L_Keyword2 ?? "—";
  const baths = property.LM_Dec_3 ?? "—";
  const sqft = property.LM_Int2_3
    ? Number(property.LM_Int2_3).toLocaleString("en-US")
    : "—";
  return `${beds} bd · ${baths} ba · ${sqft} sqft`;
}

export default function PropertyCard({ property }) {
  const photoUrl = getPrimaryPhotoUrl(property.L_Photos);
  const [photoFailed, setPhotoFailed] = useState(false);
  const showPhoto = Boolean(photoUrl) && !photoFailed;

  const location = [property.L_City, property.L_State]
    .filter(Boolean)
    .join(", ");

  return (
    <article className="property-card">
      <div className="property-card__media">
        {showPhoto ? (
          <img
            src={photoUrl}
            alt={property.L_Address || "Property"}
            loading="lazy"
            onError={() => setPhotoFailed(true)}
          />
        ) : (
          <div className="property-card__placeholder">No photo available</div>
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
    </article>
  );
}
