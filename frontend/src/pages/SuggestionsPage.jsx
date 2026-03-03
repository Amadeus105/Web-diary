import React, { useEffect, useState } from "react";
import { getSuggestions, createSuggestion, getAISuggestions } from "../services/api";

const SuggestionsPage = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("book");
  const [description, setDescription] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);

  const fetchSuggestions = async () => {
    const data = await getSuggestions();
    setSuggestions(data);
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createSuggestion({ title, type, description });
    setTitle("");
    setType("book");
    setDescription("");
    fetchSuggestions();
  };

const [aiIntro, setAiIntro] = useState("");

const handleAISuggestions = async () => {
    setLoadingAI(true);
    const data = await getAISuggestions();
    setAiIntro(data.intro);
    setAiSuggestions(data.suggestions);
    setLoadingAI(false);
};
  return (
    <div>
      <h2 className="mb-4">Suggestions</h2>

      <form onSubmit={handleSubmit} className="mb-4">
        <input
          className="form-control mb-2"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <select
          className="form-control mb-2"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="book">Book</option>
          <option value="game">Game</option>
        </select>
        <textarea
          className="form-control mb-2"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button className="btn btn-primary">Add Suggestion</button>
      </form>

      <h4>My Suggestions</h4>
      {suggestions.length === 0 ? (
        <p>No suggestions yet</p>
      ) : (
        <ul className="list-group mb-4">
          {suggestions.map((s) => (
            <li key={s.id} className="list-group-item">
              <b>{s.title}</b> ({s.type})
              {s.description && <p className="mb-0 text-muted">{s.description}</p>}
            </li>
          ))}
        </ul>
      )}

      <h4>AI Recommendations</h4>
      <button
    className="btn btn-success mb-3"
    onClick={handleAISuggestions}
    disabled={loadingAI}
    >
    {loadingAI ? "⏳ AI is thinking, this may take a minute..." : "Get AI Recommendations"}
      </button>

     {aiIntro && (
    <p className="text-muted fst-italic mb-3">{aiIntro}</p>
)}

{aiSuggestions.length > 0 && (
    <ul className="list-group">
        {aiSuggestions.map((s, index) => (
            <li key={index} className="list-group-item">
                <b>{s.title}</b> ({s.type})
                {s.description && <p className="mb-0 text-muted">{s.description}</p>}
            </li>
        ))}
    </ul>
)}
    </div>
  );
};

export default SuggestionsPage;