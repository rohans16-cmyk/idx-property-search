import { useEffect, useRef, useState } from "react";
import { parsePhotoUrls } from "../utils/photos";

export default function PropertyImageGallery({ photos, alt = "Property" }) {
  const urls = parsePhotoUrls(photos);
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [failed, setFailed] = useState({});
  const lightboxRef = useRef(null);

  const current = urls[index];
  const showPhoto = Boolean(current) && !failed[index];
  const count = urls.length;

  useEffect(() => {
    if (index >= count && count > 0) {
      setIndex(0);
    }
  }, [count, index]);

  useEffect(() => {
    if (!lightboxOpen) return undefined;

    // Debug challenge: a div only receives keydown if it can take focus.
    // tabIndex={0} + focus() makes Escape / arrow keys fire on the lightbox.
    lightboxRef.current?.focus();

    function onKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        setLightboxOpen(false);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        setIndex((prev) => (prev - 1 + count) % count);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        setIndex((prev) => (prev + 1) % count);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [lightboxOpen, count]);

  if (count === 0) {
    return (
      <div className="photo-gallery">
        <div className="photo-gallery__main property-card__placeholder">
          No photo available
        </div>
      </div>
    );
  }

  function selectThumb(nextIndex) {
    setIndex(nextIndex);
  }

  function closeLightbox(event) {
    if (event.target === event.currentTarget) {
      setLightboxOpen(false);
    }
  }

  return (
    <div className="photo-gallery">
      <button
        type="button"
        className="photo-gallery__main"
        onClick={() => showPhoto && setLightboxOpen(true)}
        aria-label="Open photo lightbox"
      >
        {showPhoto ? (
          <img
            src={current}
            alt={alt}
            onError={() => setFailed((prev) => ({ ...prev, [index]: true }))}
          />
        ) : (
          <div className="property-card__placeholder">No photo available</div>
        )}
      </button>

      {count > 1 && (
        <ul className="photo-gallery__thumbs">
          {urls.map((url, i) => (
            <li key={`${url}-${i}`}>
              <button
                type="button"
                className={
                  i === index
                    ? "photo-gallery__thumb photo-gallery__thumb--active"
                    : "photo-gallery__thumb"
                }
                onClick={() => selectThumb(i)}
                aria-label={`Show photo ${i + 1} of ${count}`}
                aria-current={i === index}
              >
                <img src={url} alt="" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {lightboxOpen && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Photo lightbox"
          tabIndex={0}
          ref={lightboxRef}
          onClick={closeLightbox}
          onKeyDown={(event) => {
            if (event.key === "Escape") setLightboxOpen(false);
            if (event.key === "ArrowLeft") {
              setIndex((prev) => (prev - 1 + count) % count);
            }
            if (event.key === "ArrowRight") {
              setIndex((prev) => (prev + 1) % count);
            }
          }}
        >
          <div className="lightbox__frame">
            <img src={current} alt={alt} />
            <p className="lightbox__counter">
              {index + 1} / {count}
            </p>


            {count > 1 && (
              <>
                <button
                  type="button"
                  className="lightbox__arrow lightbox__arrow--prev"
                  aria-label="Previous photo"
                  onClick={() => setIndex((prev) => (prev - 1 + count) % count)}
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="lightbox__arrow lightbox__arrow--next"
                  aria-label="Next photo"
                  onClick={() => setIndex((prev) => (prev + 1) % count)}
                >
                  ›
                </button>
              </>
            )}
            <button
              type="button"
              className="lightbox__close"
              aria-label="Close lightbox"
              onClick={() => setLightboxOpen(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
