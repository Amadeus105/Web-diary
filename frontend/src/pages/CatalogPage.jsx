import { useState } from "react";
import { searchBooks, searchGames, createItem } from "../services/api";

const CatalogPage = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [type, setType] = useState("books");
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [rating, setRating] = useState("");
  const [finishedDate, setFinishedDate] = useState("");
  const [notes, setNotes] = useState("");
  const [success, setSuccess] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    const data = type === "books" ? await searchBooks(query) : await searchGames(query);
    setResults(data);
    setLoading(false);
  };

  const handleAddToCompleted = async () => {
    await createItem({
      name: selectedItem.title,
      type: selectedItem.type,
      rating: rating ? Number(rating) : null,
      finished_date: finishedDate ? finishedDate : null,
      notes: notes ? notes : null,
    });
    setSelectedItem(null);
    setRating("");
    setFinishedDate("");
    setNotes("");
    setSuccess(`"${selectedItem.title}" added to Completed!`);
    setTimeout(() => setSuccess(""), 3000);
  };

  return (
    <div>
      <h2 className="mb-4">Catalog</h2>

      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSearch} className="mb-4">
        <div className="d-flex gap-2">
          <select
            className="form-select"
            style={{ maxWidth: "150px" }}
            value={type}
            onChange={(e) => { setType(e.target.value); setResults([]); }}
          >
            <option value="books">Books</option>
            <option value="games">Games</option>
          </select>
          <input
            className="form-control"
            placeholder={`Search ${type}...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="btn btn-primary" type="submit">Search</button>
        </div>
      </form>

      {loading && <p>Searching...</p>}

      <div className="row">
        {results.map((item) => (
          <div key={item.id} className="col-md-3 mb-4">
            <div className="card h-100">
              {item.cover && (
                <img
                  src={item.cover}
                  alt={item.title}
                  className="card-img-top"
                  style={{ height: "200px", objectFit: "cover" }}
                />
              )}
              <div className="card-body d-flex flex-column">
                <h6 className="card-title">{item.title}</h6>
                {item.authors && <p className="text-muted small">{item.authors.join(", ")}</p>}
                {item.year && <p className="text-muted small">{item.year}</p>}
                {item.genre?.length > 0 && (
                  <p className="text-muted small">{item.genre.join(", ")}</p>
                )}
                {item.description && (
                  <p className="card-text small" style={{
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical"
                  }}>
                    {item.description}
                  </p>
                )}
                <button
                  className="btn btn-success btn-sm mt-auto"
                  onClick={() => setSelectedItem(item)}
                >
                  ✅ Add to Completed
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedItem && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add "{selectedItem.title}" to Completed</h5>
                <button className="btn-close" onClick={() => setSelectedItem(null)} />
              </div>
              <div className="modal-body">
                <input
                  className="form-control mb-2"
                  type="number"
                  placeholder="Rating (1-10)"
                  min="1"
                  max="10"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                />
                <input
                  className="form-control mb-2"
                  type="date"
                  placeholder="Finished date"
                  value={finishedDate}
                  onChange={(e) => setFinishedDate(e.target.value)}
                />
                <textarea
                  className="form-control mb-2"
                  placeholder="Notes (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setSelectedItem(null)}>
                  Cancel
                </button>
                <button className="btn btn-success" onClick={handleAddToCompleted}>
                  Add to Completed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogPage;