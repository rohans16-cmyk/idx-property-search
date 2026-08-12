import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchOpenHouses, fetchPropertyDetail } from "../api/client";
import OpenHouseList from "../components/OpenHouseList";
import PropertyImageGallery from "../components/PropertyImageGallery";
import PropertyMap from "../components/PropertyMap";
import { formatNumber, formatPrice } from "../utils/format";

function DetailRow({ label, value }) {
  if (value == null || value === "") return null;
  return (
    <div className="detail-facts__row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default function PropertyDetailPage() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [openHouses, setOpenHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setProperty(null);
      setOpenHouses([]);

      try {
        const [detail, events] = await Promise.all([
          fetchPropertyDetail(id),
          fetchOpenHouses(id),
        ]);
        if (cancelled) return;
        setProperty(detail);
        setOpenHouses(Array.isArray(events) ? events : []);
      } catch (err) {
        if (cancelled) return;
        setError(err.message || "Failed to load property");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const location = property
    ? [property.L_Address, property.L_City, property.L_State, property.L_Zip]
        .filter(Boolean)
        .join(", ")
    : "";

  return (
    <main className="detail-page">
      <Link className="detail-page__back" to="/">
        ← Back to listings
      </Link>

      {loading && <p className="listings-page__status">Loading property…</p>}

      {error && (
        <p className="listings-page__error" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && property && (
        <>
          <header className="detail-page__header">
            <p className="detail-page__price">
              {formatPrice(property.L_SystemPrice)}
            </p>
            <h1>{property.L_Address || "Address unavailable"}</h1>
            <p className="detail-page__location">
              {location || "Location N/A"}
            </p>
            <ul className="detail-page__stats">
              <li>
                <strong>{property.L_Keyword2 ?? "—"}</strong> beds
              </li>
              <li>
                <strong>{property.LM_Dec_3 ?? "—"}</strong> baths
              </li>
              <li>
                <strong>{formatNumber(property.LM_Int2_3) || "—"}</strong> sqft
              </li>
              <li>
                <strong>{property.YearBuilt ?? "—"}</strong> year built
              </li>
            </ul>
          </header>

          <PropertyImageGallery
            photos={property.L_Photos}
            alt={property.L_Address || "Property"}
          />

          {property.L_Remarks && (
            <section className="detail-page__section">
              <h2>Description</h2>
              <p className="detail-page__description">{property.L_Remarks}</p>
            </section>
          )}

          <section className="detail-page__section">
            <h2>Property details</h2>
            <dl className="detail-facts">
              <DetailRow label="Type" value={property.L_Type_} />
              <DetailRow label="Status" value={property.L_Status} />
              <DetailRow label="ZIP" value={property.L_Zip} />
              <DetailRow label="Year built" value={property.YearBuilt} />
              <DetailRow label="Listing ID" value={property.L_ListingID} />
            </dl>
          </section>

          <PropertyMap property={property} />
          <OpenHouseList openHouses={openHouses} />
        </>
      )}
    </main>
  );
}
