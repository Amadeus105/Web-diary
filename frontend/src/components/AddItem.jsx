import React, { useState } from "react";
import { createItem } from "../services/api";

const AddItem = ({ onItemAdded }) => {
  const [open, setOpen]       = useState(false);
  const [name, setName]       = useState("");
  const [type, setType]       = useState("game");
  const [status, setStatus]   = useState("completed");
  const [rating, setRating]   = useState("");
  const [finishedDate, setFinishedDate] = useState("");
  const [notes, setNotes]     = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setName(""); setType("game"); setStatus("completed");
    setRating(""); setFinishedDate(""); setNotes(""); setCoverUrl("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await createItem({
      name,
      type,
      status,
      rating:        status === "completed" && rating ? Number(rating) : null,
      finished_date: status === "completed" && finishedDate ? finishedDate : null,
      notes:         notes || null,
      cover_url:     coverUrl || null,
    });
    reset();
    setLoading(false);
    setOpen(false);
    onItemAdded();
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

  const toggleBtn = (value, label, activeColor) => (
    <button
      key={value}
      type="button"
      onClick={() => setStatus(value)}
      style={{
        flex: 1, padding: "10px", borderRadius: "10px", cursor: "pointer",
        border: status === value ? "none" : "1px solid var(--block-border)",
        background: status === value ? activeColor : "rgba(255,255,255,0.04)",
        color: status === value ? "white" : "var(--text-color)",
        fontWeight: "700", fontSize: "13px", transition: "all 0.18s",
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ marginBottom: "8px" }}>
      {/* Collapsed trigger */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "11px 20px", borderRadius: "12px",
            border: "1px dashed var(--block-border)", background: "transparent",
            color: "var(--text-color)", opacity: 0.6, fontSize: "14px",
            fontWeight: "600", cursor: "pointer", transition: "opacity 0.2s, border-color 0.2s",
            marginBottom: "24px",
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.borderColor = "#7c3aed"; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = "0.6"; e.currentTarget.style.borderColor = "var(--block-border)"; }}
        >
          <span style={{ fontSize: "18px" }}>＋</span> Add New Entry
        </button>
      )}

      {/* Expanded form */}
      {open && (
        <div style={{
          background: "var(--block-bg)", backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)", borderRadius: "18px",
          border: "1px solid var(--block-border)", padding: "28px",
          marginBottom: "28px", boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        }}>
          <h4 style={{ margin: "0 0 20px", color: "var(--text-color)", fontWeight: "800", fontSize: "16px" }}>
            ＋ New Entry
          </h4>

          <form onSubmit={handleSubmit}>

            {/* Title */}
            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>Title</label>
              <input
                style={inputStyle} placeholder="e.g. The Witcher 3"
                value={name} onChange={e => setName(e.target.value)}
                onFocus={focus} onBlur={blur} required
              />
            </div>

            {/* Type + Status row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
              <div>
                <label style={labelStyle}>Type</label>
                <div style={{ display: "flex", gap: "6px" }}>
                  {["game", "book"].map(t => (
                    <button key={t} type="button" onClick={() => setType(t)} style={{
                      flex: 1, padding: "10px", borderRadius: "10px", cursor: "pointer",
                      border: type === t ? "none" : "1px solid var(--block-border)",
                      background: type === t
                        ? (t === "game" ? "linear-gradient(135deg,#10b981,#059669)" : "linear-gradient(135deg,#7c3aed,#5b21b6)")
                        : "rgba(255,255,255,0.04)",
                      color: type === t ? "white" : "var(--text-color)",
                      fontWeight: "700", fontSize: "13px", transition: "all 0.18s",
                    }}>
                      {t === "game" ? "🎮 Game" : "📚 Book"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Status</label>
                <div style={{ display: "flex", gap: "6px" }}>
                  {toggleBtn("completed", "✅ Completed", "linear-gradient(135deg,#7c3aed,#5b21b6)")}
                  {toggleBtn("wishlist",  "🔖 Wishlist",  "linear-gradient(135deg,#f59e0b,#d97706)")}
                </div>
              </div>
            </div>

            {/* Completed-only fields */}
            {status === "completed" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                <div>
                  <label style={labelStyle}>Rating (1–10)</label>
                  <input
                    style={inputStyle} type="number" min="1" max="10"
                    placeholder="8" value={rating}
                    onChange={e => setRating(e.target.value)}
                    onFocus={focus} onBlur={blur}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Finished Date</label>
                  <input
                    style={inputStyle} type="date" value={finishedDate}
                    onChange={e => setFinishedDate(e.target.value)}
                    onFocus={focus} onBlur={blur}
                  />
                </div>
              </div>
            )}

            {/* Wishlist hint */}
            {status === "wishlist" && (
              <div style={{
                background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)",
                borderRadius: "10px", padding: "10px 14px", marginBottom: "14px",
                color: "var(--text-color)", opacity: 0.7, fontSize: "13px",
              }}>
                🔖 You can add a rating and date later when you finish it.
              </div>
            )}

            {/* Cover URL */}
            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>Cover URL (optional)</label>
              <input
                style={inputStyle} placeholder="https://..."
                value={coverUrl} onChange={e => setCoverUrl(e.target.value)}
                onFocus={focus} onBlur={blur}
              />
            </div>

            {/* Notes */}
            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>Notes (optional)</label>
              <textarea
                style={{ ...inputStyle, minHeight: "70px", resize: "vertical" }}
                placeholder={status === "wishlist" ? "Why do you want to play/read this?" : "Your thoughts..."}
                value={notes} onChange={e => setNotes(e.target.value)}
                onFocus={focus} onBlur={blur}
              />
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "10px" }}>
              <button type="submit" disabled={loading} style={{
                flex: 1, padding: "12px", borderRadius: "10px", border: "none",
                background: loading
                  ? "rgba(124,58,237,0.4)"
                  : status === "wishlist"
                    ? "linear-gradient(135deg,#f59e0b,#d97706)"
                    : "linear-gradient(135deg,#7c3aed,#5b21b6)",
                color: "white", fontWeight: "700", fontSize: "14px",
                cursor: loading ? "not-allowed" : "pointer", transition: "background 0.2s",
              }}>
                {loading ? "⏳ Saving..." : status === "wishlist" ? "🔖 Add to Wishlist" : "✅ Save Entry"}
              </button>
              <button type="button" onClick={() => { setOpen(false); reset(); }} style={{
                padding: "12px 20px", borderRadius: "10px",
                border: "1px solid var(--block-border)", background: "transparent",
                color: "var(--text-color)", fontWeight: "600", fontSize: "14px",
                cursor: "pointer", opacity: 0.6,
              }}>
                Cancel
              </button>
            </div>

          </form>
        </div>
      )}
    </div>
  );
};

export default AddItem;