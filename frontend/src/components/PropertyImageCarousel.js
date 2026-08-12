import { useState } from "react";
import { parsePhotoUrls } from "../utils/photos";

export default function PropertyImageCarousel({ photos, alt = "Property" }) {
  const urls = parsePhotoUrls(photos);
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState({});

  const current = urls[index];
  const showPhoto = Boolean(current) && !failed[index];
  const count = urls.length;

  function go(delta, event) {
    event.preventDefault();
    event.stopPropagation();
    if (count < 2) return;
    setIndex((prev) => (prev + delta + count) % count);
  }

  return (
    <div className="photo-carousel">
      {showPhoto ? (
        <img
          src={current}
          alt={alt}
          loading="lazy"
          onError={() => setFailed((prev) => ({ ...prev, [index]: true }))}
        />
      ) : (
        <div className="property-card__placeholder">No photo available</div>
      )}

      {count > 0 && (
        <span className="photo-carousel__counter" aria-live="polite">
          {Math.min(index + 1, count)} / {count}
        </span>
      )}

      {count > 1 && (
        <>
          <button
            type="button"
            className="photo-carousel__arrow photo-carousel__arrow--prev"
            aria-label="Previous photo"
            onClick={(event) => go(-1, event)}
          >
            ‹
          </button>
          <button
            type="button"
            className="photo-carousel__arrow photo-carousel__arrow--next"
            aria-label="Next photo"
            onClick={(event) => go(1, event)}
          >
            ›
          </button>
        </>
      )}
    </div>
  );
}
