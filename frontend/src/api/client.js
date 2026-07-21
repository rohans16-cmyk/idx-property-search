async function request(path) {
  let response;

  try {
    response = await fetch(path);
  } catch (error) {
    throw new Error(
      "Unable to reach the API server. Is the backend running on port 5001?"
    );
  }

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      (body && body.error) ||
      (typeof body === "string" && body) ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return body;
}

function toQueryString(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export function fetchProperties(params = {}) {
  return request(`/api/properties${toQueryString(params)}`);
}

export function fetchPropertyDetail(id) {
  return request(`/api/properties/${encodeURIComponent(id)}`);
}

export function fetchOpenHouses(id) {
  return request(`/api/properties/${encodeURIComponent(id)}/openhouses`);
}
