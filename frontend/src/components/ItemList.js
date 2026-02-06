import React, { useEffect, useState } from "react";
import { getItems, deleteItem } from "../services/api";
import AddItem from "./AddItem";

const ItemList = () => {
  const [items, setItems] = useState([]);

  const fetchItems = async () => {
    const data = await getItems();
    setItems(data);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div>
      <AddItem onItemAdded={fetchItems} />

      <h2 className="mb-3">Completed Items</h2>

      {items.length === 0 ? (
        <p>No items yet</p>
      ) : (
        <ul className="list-group">
          {items.map((item) => (
            <li
              key={item.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <span>
                <b>{item.name}</b> ({item.type}) — Rating:{" "}
                {item.rating ?? "N/A"}
              </span>

              <button
                className="btn btn-sm btn-danger"
                onClick={async () => {
                  await deleteItem(item.id);
                  fetchItems();
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ItemList;
