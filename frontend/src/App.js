import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppNav from "./components/AppNav";
import ErrorBoundary from "./components/ErrorBoundary";
import { FavoritesProvider, useFavoritesContext } from "./hooks/FavoritesContext";
import FavoritesPage from "./pages/FavoritesPage";
import ListingsPage from "./pages/ListingsPage";
import PropertyDetailPage from "./pages/PropertyDetailPage";

function AppShell() {
  const { favoritesCount } = useFavoritesContext();

  return (
    <div className="app-shell">
      <AppNav favoritesCount={favoritesCount} />
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<ListingsPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/property/:id" element={<PropertyDetailPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <FavoritesProvider>
        <AppShell />
      </FavoritesProvider>
    </BrowserRouter>
  );
}
