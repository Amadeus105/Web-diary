import axios from "axios";

const API_URL = "http://127.0.0.1:8000/items/";

// GET all items
export const getItems = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

// POST new item
export const addItem = async (item) => {
  const res = await axios.post(API_URL, item);
  return res.data;
};

// DELETE an item
export const deleteItem = async (id) => {
  const res = await axios.delete(`${API_URL}${id}`);
  return res.data;
};
