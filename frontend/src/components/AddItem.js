import React, { useState } from "react";
import { addItem } from "../services/api";

const AddItem = ({ onItemAdded }) => {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [rating, setRating] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newItem = {
      name,
      type,
      rating: rating ? Number(rating) : null,
    };

    await addItem(newItem);

    setName("");
    setType("");
    setRating("");

    onItemAdded();
  };

  return (
    <form onSubmit={handleSubmit} className="card p-3 mb-4">
      <h4 className="mb-3">Add new item</h4>

      <input
        className="form-control mb-2"
        type="text"
        placeholder="Name (Witcher 3, 1984...)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <input
        className="form-control mb-2"
        type="text"
        placeholder="Type (Game / Book)"
        value={type}
        onChange={(e) => setType(e.target.value)}
        required
      />

      <input
        className="form-control mb-3"
        type="number"
        placeholder="Rating (1-10)"
        value={rating}
        onChange={(e) => setRating(e.target.value)}
      />

      <button type="submit" className="btn btn-primary">
        Add
      </button>
    </form>
  );
};

export default AddItem;
