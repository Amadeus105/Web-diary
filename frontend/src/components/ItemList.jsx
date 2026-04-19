import React, { useEffect, useState, useCallback } from "react";
import { getItems, deleteItem, updateItem, markItemComplete } from "../services/api";
import AddItem from "./AddItem";

/* ─── constants ─────────────────────────────────────────── */
const TYPE_ACCENT  = { game: "#10b981", book: "#7c3aed" };
const TYPE_EMOJI   = { game: "🎮", book: "📚" };

const StarRating = ({ value, max = 10 }) => (
  <span style={{ fontSize: "12px", letterSpacing: "0.5px" }}>
    {Array.from({ length: max }, (_, i) => (
      <span key={i} style={{ color: i < (value ?? 0) ? "#f59e0b" : "rgba(128,128,128,0.25)" }}>★</span>
    ))}
  </span>
);

/* ─── Detail Modal ──────────────────────────────────────── */
const DetailModal = ({ item, onClose, onEdit, onDelete, onMarkComplete }) => {
  const accent = TYPE_ACCENT[item.type] ?? "#7c3aed";
  const isWishlist = item.status === "wishlist";

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 2000,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)", padding: "20px",
    }}>
      <style>{`@keyframes detailIn { from { opacity:0; transform:scale(0.95) translateY(8px); } to { opacity:1; transform:none; } }`}</style>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: "520px",
        background: "var(--block-bg)",
        backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        borderRadius: "24px", border: `1px solid ${accent}44`,
        overflow: "hidden",
        boxShadow: `0 24px 64px rgba(0,0,0,0.35), 0 0 0 1px ${accent}22`,
        animation: "detailIn 0.2s ease",
      }}>
        {/* Cover */}
        <div style={{
          height: "220px", position: "relative",
          background: item.cover_url
            ? `url(${item.cover_url}) center/cover no-repeat`
            : `linear-gradient(135deg, ${accent}22, ${accent}08)`,
        }}>
          {!item.cover_url && (
            <div style={{ position: "absolute", inset: 0, display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: "72px", opacity: 0.25 }}>
              {TYPE_EMOJI[item.type] ?? "📄"}
            </div>
          )}
          <div style={{ position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)" }} />
          <button onClick={onClose} style={{
            position: "absolute", top: "12px", right: "12px",
            width: "32px", height: "32px", borderRadius: "50%", border: "none",
            background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)",
            color: "white", fontSize: "16px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>✕</button>
          <div style={{ position: "absolute", top: "12px", left: "12px", display: "flex", gap: "6px" }}>
            <span style={{
              padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700",
              background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", color: accent,
            }}>
              {TYPE_EMOJI[item.type]} {item.type}
            </span>
            {isWishlist && (
              <span style={{
                padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700",
                background: "rgba(245,158,11,0.2)", border: "1px solid rgba(245,158,11,0.4)", color: "#f59e0b",
              }}>🔖 Wishlist</span>
            )}
          </div>
          <div style={{ position: "absolute", bottom: "16px", left: "20px", right: "20px" }}>
            <h2 style={{ color: "white", fontWeight: "900", fontSize: "22px",
              margin: 0, textShadow: "0 2px 8px rgba(0,0,0,0.5)", letterSpacing: "-0.3px" }}>
              {item.name}
            </h2>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px 24px" }}>
          <div style={{ display: "flex", gap: "20px", marginBottom: "16px", flexWrap: "wrap" }}>
            {item.rating != null && (
              <div>
                <div style={{ color: "var(--text-color)", opacity: 0.45, fontSize: "11px",
                  fontWeight: "700", letterSpacing: "0.6px", marginBottom: "4px" }}>RATING</div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <StarRating value={item.rating} />
                  <span style={{ color: "var(--text-color)", fontWeight: "800", fontSize: "15px" }}>
                    {item.rating}/10
                  </span>
                </div>
              </div>
            )}
            {item.finished_date && (
              <div>
                <div style={{ color: "var(--text-color)", opacity: 0.45, fontSize: "11px",
                  fontWeight: "700", letterSpacing: "0.6px", marginBottom: "4px" }}>FINISHED</div>
                <div style={{ color: "var(--text-color)", fontWeight: "700", fontSize: "14px" }}>
                  📅 {item.finished_date}
                </div>
              </div>
            )}
          </div>

          {item.notes && (
            <div style={{
              background: "rgba(255,255,255,0.04)", borderRadius: "12px",
              border: "1px solid var(--block-border)", padding: "14px 16px", marginBottom: "20px",
            }}>
              <div style={{ color: "var(--text-color)", opacity: 0.45, fontSize: "11px",
                fontWeight: "700", letterSpacing: "0.6px", marginBottom: "8px" }}>NOTES</div>
              <p style={{ color: "var(--text-color)", fontSize: "14px", margin: 0,
                lineHeight: 1.6, opacity: 0.85 }}>{item.notes}</p>
            </div>
          )}

          {isWishlist && !item.notes && !item.rating && (
            <div style={{ textAlign: "center", padding: "8px 0 16px",
              color: "var(--text-color)", opacity: 0.35, fontSize: "13px" }}>
              No details yet — add notes and a rating once you finish it!
            </div>
          )}

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {isWishlist && (
              <button onClick={onMarkComplete} style={{
                flex: 1, padding: "11px 16px", borderRadius: "10px", border: "none",
                background: "linear-gradient(135deg,#10b981,#059669)",
                color: "white", fontWeight: "700", fontSize: "13px", cursor: "pointer", minWidth: "140px",
              }}>✅ Mark as Completed</button>
            )}
            <button onClick={onEdit} style={{
              flex: 1, padding: "11px 16px", borderRadius: "10px", border: "none",
              background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
              color: "white", fontWeight: "700", fontSize: "13px", cursor: "pointer", minWidth: "80px",
            }}>✏️ Edit</button>
            <button onClick={onDelete} style={{
              padding: "11px 16px", borderRadius: "10px",
              border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)",
              color: "#ef4444", fontWeight: "700", fontSize: "13px", cursor: "pointer",
            }}>🗑 Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Edit Modal ────────────────────────────────────────── */
const EditModal = ({ item, onSave, onCancel }) => {
  const [name, setName]         = useState(item.name);
  const [type, setType]         = useState(item.type);
  const [rating, setRating]     = useState(item.rating ?? "");
  const [date, setDate]         = useState(item.finished_date ?? "");
  const [notes, setNotes]       = useState(item.notes ?? "");
  const [coverUrl, setCoverUrl] = useState(item.cover_url ?? "");

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
    <div onClick={onCancel} style={{
      position: "fixed", inset: 0, zIndex: 3000,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)", padding: "20px",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: "460px",
        background: "var(--block-bg)", backdropFilter: "blur(24px)",
        borderRadius: "20px", border: "1px solid var(--block-border)",
        padding: "32px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
      }}>
        <h3 style={{ margin: "0 0 24px", color: "var(--text-color)", fontWeight: "800", fontSize: "18px" }}>
          ✏️ Edit Entry
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={labelStyle}>Title</label>
            <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} onFocus={focus} onBlur={blur} />
          </div>
          <div>
            <label style={labelStyle}>Type</label>
            <div style={{ display: "flex", gap: "8px" }}>
              {["game", "book"].map(t => (
                <button key={t} type="button" onClick={() => setType(t)} style={{
                  flex: 1, padding: "10px", borderRadius: "10px", cursor: "pointer",
                  border: type === t ? "none" : "1px solid var(--block-border)",
                  background: type === t
                    ? (t === "game" ? "linear-gradient(135deg,#10b981,#059669)" : "linear-gradient(135deg,#7c3aed,#5b21b6)")
                    : "rgba(255,255,255,0.04)",
                  color: type === t ? "white" : "var(--text-color)", fontWeight: "700", fontSize: "13px",
                }}>
                  {t === "game" ? "🎮 Game" : "📚 Book"}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={labelStyle}>Rating (1–10)</label>
              <input style={inputStyle} type="number" min="1" max="10" value={rating}
                onChange={e => setRating(e.target.value)} onFocus={focus} onBlur={blur} />
            </div>
            <div>
              <label style={labelStyle}>Finished Date</label>
              <input style={inputStyle} type="date" value={date}
                onChange={e => setDate(e.target.value)} onFocus={focus} onBlur={blur} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Cover URL</label>
            <input style={inputStyle} value={coverUrl} placeholder="https://..."
              onChange={e => setCoverUrl(e.target.value)} onFocus={focus} onBlur={blur} />
          </div>
          <div>
            <label style={labelStyle}>Notes</label>
            <textarea style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
              value={notes} onChange={e => setNotes(e.target.value)} onFocus={focus} onBlur={blur} />
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
          <button onClick={() => onSave({
            name, type,
            rating: rating ? Number(rating) : null,
            finished_date: date || null,
            notes: notes || null,
            cover_url: coverUrl || null,
          })} style={{
            flex: 1, padding: "12px", borderRadius: "10px", border: "none",
            background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
            color: "white", fontWeight: "700", fontSize: "14px", cursor: "pointer",
          }}>Save Changes</button>
          <button onClick={onCancel} style={{
            flex: 1, padding: "12px", borderRadius: "10px",
            border: "1px solid var(--block-border)", background: "transparent",
            color: "var(--text-color)", fontWeight: "600", fontSize: "14px",
            cursor: "pointer", opacity: 0.65,
          }}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

/* ─── Item Card ─────────────────────────────────────────── */
const ItemCard = ({ item, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const accent = TYPE_ACCENT[item.type] ?? "#7c3aed";
  const isWishlist = item.status === "wishlist";

  return (
    <div onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: "18px", cursor: "pointer",
        border: `1px solid ${hovered ? accent + "55" : "var(--block-border)"}`,
        background: "var(--block-bg)", backdropFilter: "blur(16px)",
        overflow: "hidden",
        transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
        transform: hovered ? "translateY(-4px)" : "none",
        boxShadow: hovered ? `0 16px 40px rgba(0,0,0,0.18), 0 0 0 1px ${accent}33` : "0 4px 20px rgba(0,0,0,0.08)",
        display: "flex", flexDirection: "column",
        opacity: isWishlist ? 0.88 : 1,
      }}>
      <div style={{
        height: "160px", position: "relative", flexShrink: 0,
        background: item.cover_url
          ? `url(${item.cover_url}) center/cover no-repeat`
          : `linear-gradient(135deg, ${accent}18, ${accent}06)`,
      }}>
        {!item.cover_url && (
          <div style={{ position: "absolute", inset: 0, display: "flex",
            alignItems: "center", justifyContent: "center", fontSize: "48px", opacity: 0.3 }}>
            {TYPE_EMOJI[item.type] ?? "📄"}
          </div>
        )}
        {isWishlist && (
          <div style={{
            position: "absolute", top: "10px", right: 0,
            background: "#f59e0b", color: "white",
            fontSize: "10px", fontWeight: "800", padding: "3px 10px",
            borderRadius: "4px 0 0 4px",
          }}>🔖 WISHLIST</div>
        )}
        <div style={{
          position: "absolute", top: "10px", left: "10px",
          padding: "3px 9px", borderRadius: "20px",
          background: "rgba(0,0,0,0.55)", color: accent, fontSize: "11px", fontWeight: "700",
        }}>
          {TYPE_EMOJI[item.type]} {item.type}
        </div>
      </div>
      <div style={{ padding: "14px", flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
        <h4 style={{
          margin: 0, color: "var(--text-color)", fontWeight: "700", fontSize: "14px", lineHeight: 1.3,
          overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        }}>{item.name}</h4>
        {item.rating != null && <StarRating value={item.rating} />}
        {item.finished_date && (
          <span style={{ padding: "2px 8px", borderRadius: "20px", alignSelf: "flex-start",
            background: "rgba(255,255,255,0.06)", color: "var(--text-color)",
            opacity: 0.55, fontSize: "11px" }}>
            📅 {item.finished_date}
          </span>
        )}
      </div>
    </div>
  );
};

/* ─── Main ──────────────────────────────────────────────── */
const ItemList = () => {
  const [items, setItems]             = useState([]);
  const [tab, setTab]                 = useState("completed");
  const [typeFilter, setTypeFilter]   = useState("all");
  const [detailItem, setDetailItem]   = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const fetchItems = useCallback(async () => {
    const data = await getItems();
    setItems(data);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleUpdate = async (id, payload) => {
    await updateItem(id, payload);
    setEditingItem(null);
    setDetailItem(null);
    fetchItems();
  };

  const handleDelete = async (id) => {
    await deleteItem(id);
    setDetailItem(null);
    fetchItems();
  };

  const handleMarkComplete = async (id) => {
    await markItemComplete(id);
    setDetailItem(null);
    fetchItems();
  };

  const tabItems = items.filter(i => (i.status ?? "completed") === tab);
  const filtered = tabItems.filter(i => typeFilter === "all" || i.type === typeFilter);
  const counts = {
    completed: items.filter(i => (i.status ?? "completed") === "completed").length,
    wishlist:  items.filter(i => i.status === "wishlist").length,
    game: tabItems.filter(i => i.type === "game").length,
    book: tabItems.filter(i => i.type === "book").length,
  };

  const tabBtn = (key, label) => (
    <button key={key} onClick={() => { setTab(key); setTypeFilter("all"); }} style={{
      padding: "9px 20px", borderRadius: "30px", cursor: "pointer",
      border: tab === key ? "none" : "1px solid var(--block-border)",
      background: tab === key ? "linear-gradient(135deg,#7c3aed,#5b21b6)" : "transparent",
      color: tab === key ? "white" : "var(--text-color)",
      fontWeight: "700", fontSize: "13px", transition: "all 0.2s", opacity: tab === key ? 1 : 0.55,
    }}>
      {label}
      <span style={{ marginLeft: "7px", padding: "1px 7px", borderRadius: "10px", fontSize: "11px",
        background: tab === key ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.07)" }}>
        {counts[key]}
      </span>
    </button>
  );

  const typeBtn = (key, label) => (
    <button key={key} onClick={() => setTypeFilter(key)} style={{
      padding: "6px 14px", borderRadius: "20px", cursor: "pointer",
      border: typeFilter === key ? "none" : "1px solid var(--block-border)",
      background: typeFilter === key ? "rgba(124,58,237,0.18)" : "transparent",
      color: typeFilter === key ? "#7c3aed" : "var(--text-color)",
      fontWeight: "600", fontSize: "12px", transition: "all 0.15s", opacity: typeFilter === key ? 1 : 0.5,
    }}>{label}</button>
  );

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 16px 60px" }}>
      <AddItem onItemAdded={fetchItems} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "12px", margin: "28px 0 16px" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          {tabBtn("completed", "✅ Completed")}
          {tabBtn("wishlist",  "🔖 Wishlist")}
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          {typeBtn("all",  `All (${counts.game + counts.book})`)}
          {typeBtn("game", `🎮 ${counts.game}`)}
          {typeBtn("book", `📚 ${counts.book}`)}
        </div>
      </div>

      {tab === "wishlist" && counts.wishlist === 0 ? (
        <div style={{
          background: "rgba(245,158,11,0.07)", border: "1px dashed rgba(245,158,11,0.3)",
          borderRadius: "14px", padding: "16px 20px", color: "var(--text-color)",
          opacity: 0.7, fontSize: "14px",
        }}>
          🔖 Your wishlist is empty — add items and set status to <b>Wishlist</b> when adding!
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--text-color)", opacity: 0.35 }}>
          <div style={{ fontSize: "56px", marginBottom: "12px" }}>📭</div>
          <p style={{ fontSize: "15px", fontWeight: "700", margin: "0 0 4px" }}>Nothing here</p>
          <p style={{ fontSize: "13px", margin: 0 }}>Try a different filter</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: "16px" }}>
          {filtered.map(item => (
            <ItemCard key={item.id} item={item} onClick={() => setDetailItem(item)} />
          ))}
        </div>
      )}

      {detailItem && (
        <DetailModal
          item={detailItem}
          onClose={() => setDetailItem(null)}
          onEdit={() => { setEditingItem(detailItem); setDetailItem(null); }}
          onDelete={() => handleDelete(detailItem.id)}
          onMarkComplete={() => handleMarkComplete(detailItem.id)}
        />
      )}
      {editingItem && (
        <EditModal
          item={editingItem}
          onSave={payload => handleUpdate(editingItem.id, payload)}
          onCancel={() => setEditingItem(null)}
        />
      )}
    </div>
  );
};

export default ItemList;