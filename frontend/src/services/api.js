import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000";

const getToken = () => localStorage.getItem("token");

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

// Auth
export const register = async (username, password) => {
  const response = await axios.post(`${BASE_URL}/auth/register`, { username, password });
  return response.data;
};

export const login = async (username, password) => {
  const response = await axios.post(`${BASE_URL}/auth/login`, { username, password });
  return response.data;
};

// Items
export const getItems = async () => {
  const response = await axios.get(`${BASE_URL}/items/`, { headers: authHeaders() });
  return response.data;
};

export const createItem = async (item) => {
  const response = await axios.post(`${BASE_URL}/items/`, item, { headers: authHeaders() });
  return response.data;
};

export const deleteItem = async (id) => {
  await axios.delete(`${BASE_URL}/items/${id}`, { headers: authHeaders() });
};

export const updateItem = async (id, item) => {
  const response = await axios.put(`${BASE_URL}/items/${id}`, item, { headers: authHeaders() });
  return response.data;
};

// Suggestions
export const getSuggestions = async () => {
  const response = await axios.get(`${BASE_URL}/suggestions/`, { headers: authHeaders() });
  return response.data;
};

export const createSuggestion = async (suggestion) => {
  const response = await axios.post(`${BASE_URL}/suggestions/`, suggestion, { headers: authHeaders() });
  return response.data;
};

export const getAISuggestions = async () => {
  const response = await axios.post(`${BASE_URL}/suggestions/ai`, {}, { headers: authHeaders() });
  return response.data;
};

// Admin
export const getAdminUsers = async () => {
  const response = await axios.get(`${BASE_URL}/admin/users`, { headers: authHeaders() });
  return response.data;
};

export const deleteAdminUser = async (id) => {
  await axios.delete(`${BASE_URL}/admin/users/${id}`, { headers: authHeaders() });
};

export const getAdminItems = async () => {
  const response = await axios.get(`${BASE_URL}/admin/items`, { headers: authHeaders() });
  return response.data;
};

export const deleteAdminItem = async (id) => {
  await axios.delete(`${BASE_URL}/admin/items/${id}`, { headers: authHeaders() });
};

export const getMe = async (token) => {
  const response = await axios.get(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const searchBooks = async (query) => {
  const response = await axios.get(`${BASE_URL}/catalog/books`, {
    params: { q: query },
    headers: authHeaders()
  });
  return response.data;
};

export const searchGames = async (query) => {
  const response = await axios.get(`${BASE_URL}/catalog/games`, {
    params: { q: query },
    headers: authHeaders()
  });
  return response.data;
};