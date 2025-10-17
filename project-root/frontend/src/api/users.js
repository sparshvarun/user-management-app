const BASE = import.meta.env.VITE_API_BASE;

export const fetchUsers = async () => (await fetch(`${BASE}/users`)).json();
export const fetchUser = async (id) => (await fetch(`${BASE}/users/${id}`)).json();

export const createUser = async (formData) => {
  const res = await fetch(`${BASE}/users`, { method: 'POST', body: formData });
  return res.json();
};

export const updateUser = async (id, formData) => {
  const res = await fetch(`${BASE}/users/${id}`, { method: 'PUT', body: formData });
  return res.json();
};

export const deleteUser = async (id) => {
  const res = await fetch(`${BASE}/users/${id}`, { method: 'DELETE' });
  return res.json();
};

export const followUser = async (followerId, targetId) => {
  const res = await fetch(`${BASE}/users/${followerId}/follow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetId }),
  });
  return res.json();
};

export const unfollowUser = async (followerId, targetId) => {
  const res = await fetch(`${BASE}/users/${followerId}/follow/${targetId}`, { method: 'DELETE' });
  return res.json();
};

export const fetchFollowing = async (userId) => {
  const res = await fetch(`${BASE}/users/${userId}/following`);
  return res.json();
};

