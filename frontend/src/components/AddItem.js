import React, { useState } from "react";
import { createItem } from "../services/api";

const AddItem = ({ onItemAdded }) => {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [rating, setRating] = useState("");
  const [finishedDate, setFinishedDate] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    await createItem({
      name,
      type,
      rating: rating ? Number(rating) : null,
      finished_date: finishedDate ? finishedDate : null,
      notes: notes ? notes : null,
    });

    setName("");
    setType("");
    setRating("");
    setFinishedDate("");
    setNotes("");
    onItemAdded();
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <input
        className="form-control mb-2"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        className="form-control mb-2"
        placeholder="Type"
        value={type}
        onChange={(e) => setType(e.target.value)}
        required
      />
      <input
        className="form-control mb-2"
        placeholder="Rating"
        type="number"
        value={rating}
        onChange={(e) => setRating(e.target.value)}
      />
      <input
        className="form-control mb-2"
        placeholder="Finished Date"
        type="date"
        value={finishedDate}
        onChange={(e) => setFinishedDate(e.target.value)}
      />
      <textarea
        className="form-control mb-2"
        placeholder="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <button className="btn btn-primary">Add</button>
    </form>
  );
};

export default AddItem;