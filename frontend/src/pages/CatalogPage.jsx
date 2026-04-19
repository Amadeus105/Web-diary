import { useState } from "react";
import { searchBooks, searchGames, createItem } from "../services/api";

/* ─── Add Modal ─────────────────────────────────────────── */
const AddModal = ({ item, onClose, onAdded }) => {
  const [status, setStatus]           = useState("completed");
  const [rating, setRating]           = useState("");
  const [finishedDate, setFinishedDate] = useState("");
  const [notes, setNotes]             = useState("");
  const [loading, setLoading]         = useState(false);

  const handleAdd = async () => {
    setLoading(true);
    await createItem({
      name:          item.title,
      type:          item.type,
      cover_url:     item.cover || null,
      status,
      rating:        status === "completed" && rating ? Number(rating) : null,
      finished_date: status === "completed" && finishedDate ? finishedDate : null,
      notes:         notes || null,
    });
    setLoading(false);
    onAdded(item.title, status);
    onClose();
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: "10px",
    border: "1px solid var(--block-border)", background: "rgba(255,255,255,0.04)",
    color: "var(--text-color)", fontSize: "14px", outline: "none",
    boxSizing: "border-box", transition: "border-color 0.2s",
  };
  const labelStyle = {
    display: "block", color: "var(--text-color)", opacity: 0.55,
    fontSize: "11px", fontWeight: "700", letterSpacing: "0.8px",
    marginBottom: "5px", textTransform: "uppercase",
  };
  const focus = e => (e.target.style.borderColor = "#7c3aed");
  const blur  = e => (e.target.style.borderColor = "var(--block-border)");

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 2000,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)", padding: "20px",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: "460px",
        background: "var(--block-bg)", backdropFilter: "blur(24px)",
        borderRadius: "20px", border: "1px solid var(--block-border)",
        overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.3)",
      }}>
        {/* Cover strip */}
        {item.cover && (
          <div style={{
            height: "140px",
            background: `url(${item.cover}) center/cover no-repeat`,
            position: "relative",
          }}>
            <div style={{ position: "absolute", inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 60%)" }} />
            <div style={{ position: "absolute", bottom: "14px", left: "18px", right: "18px" }}>
              <p style={{ color: "white", fontWeight: "900", fontSize: "16px",
                margin: 0, textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>{item.title}</p>
              {item.authors && (
                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "12px", margin: "2px 0 0" }}>
                  {item.authors.join(", ")}
                </p>
              )}
            </div>
          </div>
        )}

        <div style={{ padding: "24px" }}>
          {!item.cover && (
            <h3 style={{ margin: "0 0 20px", color: "var(--text-color)",
              fontWeight: "800", fontSize: "17px" }}>
              Add "{item.title}"
            </h3>
          )}

          {/* Status toggle */}
          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Add to</label>
            <div style={{ display: "flex", gap: "8px" }}>
              {[
                { value: "completed", label: "✅ Completed", color: "linear-gradient(135deg,#7c3aed,#5b21b6)" },
                { value: "wishlist",  label: "🔖 Wishlist",  color: "linear-gradient(135deg,#f59e0b,#d97706)" },
              ].map(({ value, label, color }) => (
                <button key={value} type="button" onClick={() => setStatus(value)} style={{
                  flex: 1, padding: "10px", borderRadius: "10px", cursor: "pointer",
                  border: status === value ? "none" : "1px solid var(--block-border)",
                  background: status === value ? color : "rgba(255,255,255,0.04)",
                  color: status === value ? "white" : "var(--text-color)",
                  fontWeight: "700", fontSize: "13px", transition: "all 0.18s",
                }}>{label}</button>
              ))}
            </div>
          </div>

          {/* Completed-only fields */}
          {status === "completed" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
              <div>
                <label style={labelStyle}>Rating (1–10)</label>
                <input style={inputStyle} type="number" min="1" max="10"
                  placeholder="8" value={rating}
                  onChange={e => setRating(e.target.value)} onFocus={focus} onBlur={blur} />
              </div>
              <div>
                <label style={labelStyle}>Finished Date</label>
                <input style={inputStyle} type="date" value={finishedDate}
                  onChange={e => setFinishedDate(e.target.value)} onFocus={focus} onBlur={blur} />
              </div>
            </div>
          )}

          {status === "wishlist" && (
            <div style={{
              background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)",
              borderRadius: "10px", padding: "10px 14px", marginBottom: "14px",
              color: "var(--text-color)", opacity: 0.7, fontSize: "13px",
            }}>
              🔖 You can add rating & date later when you finish it.
            </div>
          )}

          <div style={{ marginBottom: "20px" }}>
            <label style={labelStyle}>Notes (optional)</label>
            <textarea style={{ ...inputStyle, minHeight: "70px", resize: "vertical" }}
              placeholder={status === "wishlist" ? "Why do you want to read/play this?" : "Your thoughts..."}
              value={notes} onChange={e => setNotes(e.target.value)}
              onFocus={focus} onBlur={blur} />
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={handleAdd} disabled={loading} style={{
              flex: 1, padding: "12px", borderRadius: "10px", border: "none",
              background: loading ? "rgba(124,58,237,0.4)"
                : status === "wishlist"
                  ? "linear-gradient(135deg,#f59e0b,#d97706)"
                  : "linear-gradient(135deg,#7c3aed,#5b21b6)",
              color: "white", fontWeight: "700", fontSize: "14px",
              cursor: loading ? "not-allowed" : "pointer",
            }}>
              {loading ? "⏳ Saving..." : status === "wishlist" ? "🔖 Add to Wishlist" : "✅ Add to Completed"}
            </button>
            <button onClick={onClose} style={{
              padding: "12px 18px", borderRadius: "10px",
              border: "1px solid var(--block-border)", background: "transparent",
              color: "var(--text-color)", fontWeight: "600", fontSize: "14px",
              cursor: "pointer", opacity: 0.6,
            }}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Result Card ───────────────────────────────────────── */
const ResultCard = ({ item, onAdd }) => {
  const [hovered, setHovered] = useState(false);
  const accent = item.type === "book" ? "#7c3aed" : "#10b981";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: "16px",
        border: `1px solid ${hovered ? accent + "55" : "var(--block-border)"}`,
        background: "var(--block-bg)", backdropFilter: "blur(14px)",
        overflow: "hidden", display: "flex", flexDirection: "column",
        transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
        transform: hovered ? "translateY(-4px)" : "none",
        boxShadow: hovered
          ? `0 16px 40px rgba(0,0,0,0.15), 0 0 0 1px ${accent}33`
          : "0 4px 16px rgba(0,0,0,0.07)",
      }}
    >
      {/* Cover */}
      <div style={{
        height: "180px", flexShrink: 0, position: "relative",
        background: item.cover
          ? `url(${item.cover}) center/cover no-repeat`
          : `linear-gradient(135deg, ${accent}18, ${accent}06)`,
      }}>
        {!item.cover && (
          <div style={{ position: "absolute", inset: 0, display: "flex",
            alignItems: "center", justifyContent: "center",
            fontSize: "48px", opacity: 0.3 }}>
            {item.type === "book" ? "📚" : "🎮"}
          </div>
        )}
        <div style={{
          position: "absolute", top: "10px", left: "10px",
          padding: "3px 9px", borderRadius: "20px",
          background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)",
          color: accent, fontSize: "11px", fontWeight: "700",
        }}>
          {item.type === "book" ? "📚 Book" : "🎮 Game"}
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: "14px", flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
        <h4 style={{
          margin: 0, color: "var(--text-color)", fontWeight: "700",
          fontSize: "14px", lineHeight: 1.3,
          overflow: "hidden", display: "-webkit-box",
          WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        }}>{item.title}</h4>

        {item.authors && (
          <p style={{ margin: 0, color: "var(--text-color)", opacity: 0.5,
            fontSize: "12px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            ✍️ {item.authors.join(", ")}
          </p>
        )}

        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {item.year && (
            <span style={{ padding: "2px 8px", borderRadius: "20px", fontSize: "11px",
              background: "rgba(255,255,255,0.06)", color: "var(--text-color)", opacity: 0.55 }}>
              📅 {item.year}
            </span>
          )}
          {item.genre?.slice(0, 1).map(g => (
            <span key={g} style={{ padding: "2px 8px", borderRadius: "20px", fontSize: "11px",
              background: `${accent}18`, color: accent, fontWeight: "600" }}>
              {g}
            </span>
          ))}
        </div>

        {item.description && (
          <p style={{
            margin: 0, color: "var(--text-color)", opacity: 0.55, fontSize: "12px",
            lineHeight: 1.5, overflow: "hidden", display: "-webkit-box",
            WebkitLineClamp: 3, WebkitBoxOrient: "vertical",
          }}>{item.description}</p>
        )}

        <button
          onClick={() => onAdd(item)}
          style={{
            marginTop: "auto", padding: "9px", borderRadius: "10px", border: "none",
            background: hovered
              ? `linear-gradient(135deg, ${accent}, ${accent}cc)`
              : "rgba(255,255,255,0.06)",
            color: hovered ? "white" : "var(--text-color)",
            fontWeight: "700", fontSize: "13px", cursor: "pointer",
            transition: "background 0.2s, color 0.2s",
          }}
        >
          ＋ Add to Library
        </button>
      </div>
    </div>
  );
};

/* ─── Main Page ─────────────────────────────────────────── */
const CatalogPage = () => {
  const [query, setQuery]           = useState("");
  const [results, setResults]       = useState([]);
  const [type, setType]             = useState("books");
  const [loading, setLoading]       = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [toast, setToast]           = useState(null);
  const [searched, setSearched]     = useState(false);

  const showToast = (title, status) => {
    setToast({ title, status });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    const data = type === "books" ? await searchBooks(query) : await searchGames(query);
    setResults(data);
    setLoading(false);
  };

  const switchType = (t) => {
    setType(t);
    setResults([]);
    setSearched(false);
  };

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px 16px 60px" }}>

      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ color: "var(--text-color)", fontWeight: "900",
          fontSize: "clamp(26px,4vw,36px)", letterSpacing: "-0.5px", margin: "0 0 6px" }}>
          🔍 Catalog
        </h1>
        <p style={{ color: "var(--text-color)", opacity: 0.45, fontSize: "14px", margin: 0 }}>
          Search for games and books to add to your library
        </p>
      </div>

      {/* Search bar */}
      <div style={{
        background: "var(--block-bg)", backdropFilter: "blur(16px)",
        borderRadius: "18px", border: "1px solid var(--block-border)",
        padding: "20px", marginBottom: "28px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
      }}>
        {/* Type tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          {[
            { value: "books", label: "📚 Books" },
            { value: "games", label: "🎮 Games" },
          ].map(({ value, label }) => (
            <button key={value} onClick={() => switchType(value)} style={{
              padding: "8px 20px", borderRadius: "30px", cursor: "pointer",
              border: type === value ? "none" : "1px solid var(--block-border)",
              background: type === value ? "linear-gradient(135deg,#7c3aed,#5b21b6)" : "transparent",
              color: type === value ? "white" : "var(--text-color)",
              fontWeight: "700", fontSize: "13px", transition: "all 0.2s",
              opacity: type === value ? 1 : 0.55,
            }}>{label}</button>
          ))}
        </div>

        {/* Search input */}
        <form onSubmit={handleSearch} style={{ display: "flex", gap: "10px" }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={type === "books" ? "Search books, authors..." : "Search games, studios..."}
            style={{
              flex: 1, padding: "12px 16px", borderRadius: "12px",
              border: "1px solid var(--block-border)", background: "rgba(255,255,255,0.04)",
              color: "var(--text-color)", fontSize: "15px", outline: "none",
              transition: "border-color 0.2s",
            }}
            onFocus={e => (e.target.style.borderColor = "#7c3aed")}
            onBlur={e => (e.target.style.borderColor = "var(--block-border)")}
          />
          <button type="submit" disabled={loading} style={{
            padding: "12px 24px", borderRadius: "12px", border: "none",
            background: loading ? "rgba(124,58,237,0.4)" : "linear-gradient(135deg,#7c3aed,#5b21b6)",
            color: "white", fontWeight: "700", fontSize: "14px",
            cursor: loading ? "not-allowed" : "pointer", whiteSpace: "nowrap",
            transition: "background 0.2s",
          }}>
            {loading ? "⏳ Searching..." : "Search"}
          </button>
        </form>
      </div>

      {/* Results count */}
      {searched && !loading && (
        <p style={{ color: "var(--text-color)", opacity: 0.45, fontSize: "13px", marginBottom: "16px" }}>
          {results.length === 0
            ? `No results for "${query}"`
            : `${results.length} result${results.length !== 1 ? "s" : ""} for "${query}"`}
        </p>
      )}

      {/* Empty / initial state */}
      {!searched && !loading && (
        <div style={{ textAlign: "center", padding: "60px 20px",
          color: "var(--text-color)", opacity: 0.3 }}>
          <div style={{ fontSize: "56px", marginBottom: "12px" }}>
            {type === "books" ? "📚" : "🎮"}
          </div>
          <p style={{ fontSize: "15px", fontWeight: "700", margin: "0 0 4px" }}>
            Search for {type} above
          </p>
          <p style={{ fontSize: "13px", margin: 0 }}>
            Results will appear here
          </p>
        </div>
      )}

      {/* Results grid */}
      {results.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
          gap: "16px",
        }}>
          {results.map(item => (
            <ResultCard key={item.id} item={item} onAdd={setSelectedItem} />
          ))}
        </div>
      )}

      {/* Add modal */}
      {selectedItem && (
        <AddModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAdded={showToast}
        />
      )}

      {/* Toast notification */}
      {toast && (
        <div style={{
          position: "fixed", bottom: "28px", left: "50%",
          transform: "translateX(-50%)",
          background: toast.status === "wishlist"
            ? "linear-gradient(135deg,#f59e0b,#d97706)"
            : "linear-gradient(135deg,#10b981,#059669)",
          color: "white", padding: "12px 24px", borderRadius: "30px",
          fontWeight: "700", fontSize: "14px", zIndex: 9999,
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          animation: "fadeUp 0.3s ease",
          whiteSpace: "nowrap",
        }}>
          <style>{`@keyframes fadeUp { from { opacity:0; transform:translateX(-50%) translateY(12px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>
          {toast.status === "wishlist" ? "🔖" : "✅"} "{toast.title}" added to {toast.status === "wishlist" ? "Wishlist" : "Completed"}!
        </div>
      )}
    </div>
  );
};

export default CatalogPage;