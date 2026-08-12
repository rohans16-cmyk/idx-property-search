import { getLatLng } from "../utils/coords";

export default function PropertyMap({ property }) {
  const coords = getLatLng(property);
  if (!coords) return null;

  const { lat, lng } = coords;
  const key = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  const embedSrc = key
    ? `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(
        key
      )}&q=${lat},${lng}&zoom=15`
    : `https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <section className="property-map">
      <h2>Map</h2>
      <iframe
        className="property-map__frame"
        title="Property location"
        src={embedSrc}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      <a
        className="property-map__directions"
        href={directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        Get Directions
      </a>
    </section>
  );
}
