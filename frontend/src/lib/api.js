// Thin fetch wrapper. Always sends cookies so the JWT travels with each request.
const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  if (res.status === 401) {
    const err = new Error('Unauthorized');
    err.status = 401;
    throw err;
  }

  if (!res.ok) {
    let message = 'Request failed';
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {
      /* non-JSON error body */
    }
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  get: (p) => request(p),
  post: (p, body) => request(p, { method: 'POST', body: JSON.stringify(body) }),
  put: (p, body) => request(p, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (p, body) => request(p, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  del: (p) => request(p, { method: 'DELETE' }),
};

// Auth
export const login = (pin) => api.post('/auth/login', { pin });
export const checkSession = () => api.get('/me');

// Locations
export const getLocations = () => api.get('/locations');
export const getLocation = (id) => api.get(`/locations/${id}`);
export const createLocation = (name) => api.post('/locations', { name });
export const updateLocation = (id, name) => api.put(`/locations/${id}`, { name });
export const deleteLocation = (id) => api.del(`/locations/${id}`);

// Containers
export const getContainers = (locationId) =>
  api.get(`/containers${locationId ? `?locationId=${locationId}` : ''}`);
export const getContainer = (id) => api.get(`/containers/${id}`);
export const createContainer = (data) => api.post('/containers', data);
export const updateContainer = (id, data) => api.put(`/containers/${id}`, data);
export const deleteContainer = (id) => api.del(`/containers/${id}`);

// Items
export const getItems = (containerId) =>
  api.get(`/items${containerId ? `?containerId=${containerId}` : ''}`);
export const getRestockItems = () => api.get('/items?needsRestock=true');
export const createItem = (data) => api.post('/items', data);
export const updateItem = (id, data) => api.put(`/items/${id}`, data);
export const deleteItem = (id) => api.del(`/items/${id}`);
export const incrementItem = (id) => api.patch(`/items/${id}/increment`);
export const decrementItem = (id) => api.patch(`/items/${id}/decrement`);

// Search
export const search = (q) => api.get(`/search?q=${encodeURIComponent(q)}`);

// Upload (presigned URL)
export const getPresignedUrl = (contentType) =>
  api.get(`/upload/presigned-url?contentType=${encodeURIComponent(contentType)}`);
export const getViewUrl = (key) =>
  api.get(`/upload/view-url?key=${encodeURIComponent(key)}`);
