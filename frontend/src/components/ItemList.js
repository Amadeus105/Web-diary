import React, { useEffect, useState } from "react";
import { getItems, deleteItem, updateItem } from "../services/api";
import AddItem from "./AddItem";

const ItemList = () => {
  const [items, setItems] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [editedType, setEditedType] = useState("");
  const [editedRating, setEditedRating] = useState("");
  const [editedFinishedDate, setEditedFinishedDate] = useState("");
  const [editedNotes, setEditedNotes] = useState("");

  const fetchItems = async () => {
    const data = await getItems();
    setItems(data);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleEditClick = (item) => {
    setEditingId(item.id);
    setEditedName(item.name);
    setEditedType(item.type);
    setEditedRating(item.rating ?? "");
    setEditedFinishedDate(item.finished_date ?? "");
    setEditedNotes(item.notes ?? "");
  };

  const handleUpdate = async (id) => {
    await updateItem(id, {
      name: editedName,
      type: editedType,
      rating: editedRating ? Number(editedRating) : null,
      finished_date: editedFinishedDate ? editedFinishedDate : null,
      notes: editedNotes ? editedNotes : null,
    });

    setEditingId(null);
    fetchItems();
  };

  return (
    <div>
      <AddItem onItemAdded={fetchItems} />

      <h2 className="mb-3">Completed Items</h2>

      {items.length === 0 ? (
        <p>No items yet</p>
      ) : (
        <ul className="list-group">
          {items.map((item) => (
            <li key={item.id} className="list-group-item">
              {editingId === item.id ? (
                <div className="d-flex flex-column gap-2">
                  <input
                    className="form-control"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                  />
                  <input
                    className="form-control"
                    value={editedType}
                    onChange={(e) => setEditedType(e.target.value)}
                  />
                  <input
                    className="form-control"
                    type="number"
                    value={editedRating}
                    onChange={(e) => setEditedRating(e.target.value)}
                  />
                  <input
                    className="form-control"
                    type="date"
                    value={editedFinishedDate}
                    onChange={(e) => setEditedFinishedDate(e.target.value)}
                  />
                  <textarea
                    className="form-control"
                    value={editedNotes}
                    onChange={(e) => setEditedNotes(e.target.value)}
                  />

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleUpdate(item.id)}
                    >
                      Save
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="d-flex justify-content-between align-items-center">
                  <span>
                    <b>{item.name}</b> ({item.type}) — Rating:{" "}
                    {item.rating ?? "N/A"} — Date:{" "}
                    {item.finished_date ?? "N/A"} — Notes:{" "}
                    {item.notes ?? "N/A"}
                  </span>

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => handleEditClick(item)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={async () => {
                        await deleteItem(item.id);
                        fetchItems();
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ItemList;