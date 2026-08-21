/**
 * @jest-environment jsdom
 */
import { act, renderHook } from "@testing-library/react";
import useFavorites, { STORAGE_KEY } from "../hooks/useFavorites";

beforeEach(() => {
  window.localStorage.clear();
});

test("toggleFavorite persists ids in localStorage", () => {
  const { result } = renderHook(() => useFavorites());

  act(() => {
    result.current.toggleFavorite("42");
  });

  expect(result.current.isFavorite("42")).toBe(true);
  expect(result.current.favoritesCount).toBe(1);
  expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY))).toEqual(["42"]);

  act(() => {
    result.current.toggleFavorite("42");
  });

  expect(result.current.isFavorite("42")).toBe(false);
  expect(result.current.favoritesCount).toBe(0);
  expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY))).toEqual([]);
});
