import { NavLink } from "react-router-dom";

export default function AppNav({ favoritesCount = 0 }) {
  return (
    <nav className="app-nav" aria-label="Primary">
      <NavLink
        to="/"
        className={({ isActive }) =>
          isActive ? "app-nav__link app-nav__link--active" : "app-nav__link"
        }
        end
      >
        Listings
      </NavLink>
      <NavLink
        to="/favorites"
        className={({ isActive }) =>
          isActive ? "app-nav__link app-nav__link--active" : "app-nav__link"
        }
      >
        Favorites
        <span className="app-nav__badge" aria-label={`${favoritesCount} favorites`}>
          {favoritesCount}
        </span>
      </NavLink>
    </nav>
  );
}
