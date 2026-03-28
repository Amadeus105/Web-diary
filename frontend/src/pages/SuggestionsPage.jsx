import { useState } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:8000";
const getToken = () => localStorage.getItem("token");

const SuggestionsPage = () => {
  const [filterType, setFilterType] = useState("both");
  const [loading, setLoading] = useState(false);
  const [intro, setIntro] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState("");

  const handleGetSuggestions = async () => {
    setLoading(true);
    setError("");
    setSuggestions([]);
    setIntro("");

    try {
      const response = await axios.post(
        `${BASE_URL}/suggestions/ai?filter_type=${filterType}`,
        {},
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setIntro(response.data.intro);
      setSuggestions(response.data.suggestions);
    } catch (e) {
      setError("Failed to get suggestions. Try again.");
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h2 style={{ color: "var(--text-color)", marginBottom: "8px" }}>
        🤖 AI Recommendations
      </h2>
      <p style={{ color: "var(--text-color)", opacity: 0.6, marginBottom: "30px" }}>
        Get personalized recommendations based on your completed list
      </p>

      {/* Filter buttons */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        {["both", "book", "game"].map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            style={{
              padding: "8px 20px",
              borderRadius: "20px",
              border: "none",
              cursor: "pointer",
              fontWeight: "600",
              background: filterType === type ? "#7c3aed" : "var(--block-bg, rgba(0,0,0,0.1))",
              color: filterType === type ? "white" : "var(--text-color)",
              transition: "all 0.2s"
            }}
          >
            {type === "both" ? "📚🎮 Both" : type === "book" ? "📚 Books" : "🎮 Games"}
          </button>
        ))}
      </div>

      {/* Get button */}
      <button
        onClick={handleGetSuggestions}
        disabled={loading}
        style={{
          background: loading ? "#555" : "#7c3aed",
          color: "white",
          border: "none",
          borderRadius: "10px",
          padding: "14px 32px",
          fontSize: "16px",
          fontWeight: "bold",
          cursor: loading ? "not-allowed" : "pointer",
          marginBottom: "30px",
          transition: "background 0.2s"
        }}
      >
        {loading ? "⏳ Getting recommendations..." : "✨ Get Recommendations"}
      </button>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Intro */}
      {intro && (
        <p style={{
          color: "var(--text-color)",
          opacity: 0.8,
          fontStyle: "italic",
          marginBottom: "20px",
          padding: "16px",
          background: "var(--block-bg, rgba(0,0,0,0.05))",
          borderRadius: "10px",
          border: "1px solid var(--block-border, rgba(0,0,0,0.1))"
        }}>
          {intro}
        </p>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {suggestions.map((s, i) => (
            <div key={i} style={{
              background: "var(--block-bg, rgba(0,0,0,0.05))",
              border: "1px solid var(--block-border, rgba(0,0,0,0.1))",
              borderRadius: "12px",
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              gap: "16px"
            }}>
              <span style={{ fontSize: "28px" }}>
                {s.type === "book" ? "📚" : "🎮"}
              </span>
              <div>
                <div style={{ fontWeight: "bold", color: "var(--text-color)", fontSize: "16px" }}>
                  {s.title}
                </div>
                <div style={{ color: "var(--text-color)", opacity: 0.6, fontSize: "13px", marginTop: "4px" }}>
                  {s.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SuggestionsPage;