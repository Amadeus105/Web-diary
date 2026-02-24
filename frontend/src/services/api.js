import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

export const getItems = async () => {
  const response = await axios.get(`${API_URL}/items/`);
  return response.data;
};

export const createItem = async (item) => {
  const response = await axios.post(`${API_URL}/items/`, item);
  return response.data;
};

export const deleteItem = async (id) => {
  await axios.delete(`${API_URL}/items/${id}`);
};

export const updateItem = async (id, item) => {
  const response = await axios.put(`${API_URL}/items/${id}`, item);
  return response.data;
};
