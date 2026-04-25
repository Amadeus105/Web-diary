import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL = "http://localhost:8000";
const H = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

const STYLES = `
@keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
`;

const TYPE_ACCENT = { game: "#10b981", book: "#7c3aed" };
const TYPE_EMOJI  = { game: "🎮", book: "📚" };

const UserProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    setLoading(true);
    axios.get(`${BASE_URL}/friends/profile/${username}`, { headers: H() })
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [username]);

  if (loading) return (
    <div style={{ textAlign: "center", padding: "80px", color: "var(--text-color)", opacity: 0.4 }}>
      Loading...
    </div>
  );

  if (!data) return (
    <div style={{ textAlign: "center", padding: "80px", color: "var(--text-color)", opacity: 0.4 }}>
      User not found
    </div>
  );

  const items = data.items || [];
  const filtered = filter === "all" ? items : items.filter(i => i.type === filter);
  const gameCount = items.filter(i => i.type === "game").length;
  const bookCount = items.filter(i => i.type === "book").length;

  return (
    <>
      <style>{STYLES}</style>
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px 16px 60px" }}>

        {/* Profile header card */}
        <div style={{
          background: "var(--block-bg)", backdropFilter: "blur(6px)",
          borderRadius: "20px", border: "1px solid var(--block-border)",
          padding: "28px", marginBottom: "20px",
          animation: "fadeUp 0.3s ease",
          display: "flex", alignItems: "flex-start", gap: "20px", flexWrap: "wrap",
        }}>
          {/* Avatar */}
          <div style={{
            width: "80px", height: "80px", borderRadius: "50%", flexShrink: 0,
            background: data.avatar_url
              ? `url(${data.avatar_url}) center/cover`
              : "linear-gradient(135deg,#7c3aed,#5b21b6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontWeight: "900", fontSize: "28px",
            border: "3px solid var(--block-border)",
          }}>
            {!data.avatar_url && data.username?.[0]?.toUpperCase()}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "6px" }}>
              <h1 style={{ color: "var(--text-color)", fontWeight: "900", fontSize: "24px",
                margin: 0, letterSpacing: "-0.5px" }}>
                {data.name || data.username}
              </h1>
              {data.handle && (
                <span style={{ color: "var(--text-color)", opacity: 0.45, fontSize: "14px" }}>
                  @{data.handle}
                </span>
              )}
              {data.is_private && (
                <span style={{
                  padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700",
                  background: "rgba(239,68,68,0.1)", color: "#ef4444",
                  border: "1px solid rgba(239,68,68,0.25)",
                }}>🔒 Private</span>
              )}
            </div>
            {data.title && (
              <p style={{ color: "var(--text-color)", opacity: 0.55, fontSize: "14px", margin: "0 0 12px" }}>
                {data.title}
              </p>
            )}

            {/* Stats */}
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              <div>
                <span style={{ color: "var(--text-color)", fontWeight: "900", fontSize: "20px" }}>{gameCount}</span>
                <span style={{ color: "var(--text-color)", opacity: 0.45, fontSize: "12px", marginLeft: "5px" }}>games</span>
              </div>
              <div>
                <span style={{ color: "var(--text-color)", fontWeight: "900", fontSize: "20px" }}>{bookCount}</span>
                <span style={{ color: "var(--text-color)", opacity: 0.45, fontSize: "12px", marginLeft: "5px" }}>books</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
            {data.is_friend && (
              <button onClick={() => navigate(`/chat/${data.user_id}`)} style={{
                padding: "10px 18px", borderRadius: "10px", border: "none",
                background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
                color: "white", fontWeight: "700", fontSize: "13px", cursor: "pointer",
              }}>💬 Message</button>
            )}
            <button onClick={() => navigate("/friends")} style={{
              padding: "10px 18px", borderRadius: "10px",
              border: "1px solid var(--block-border)", background: "transparent",
              color: "var(--text-color)", fontWeight: "600", fontSize: "13px",
              cursor: "pointer", opacity: 0.7,
            }}>← Back</button>
          </div>
        </div>

        {/* Private / no items */}
        {data.is_private && !data.is_friend && (
          <div style={{
            background: "var(--block-bg)", borderRadius: "18px",
            border: "1px solid var(--block-border)", padding: "60px 20px",
            textAlign: "center", color: "var(--text-color)", opacity: 0.4,
          }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔒</div>
            <p style={{ margin: 0, fontSize: "14px" }}>This profile is private</p>
          </div>
        )}

        {/* Items grid */}
        {(!data.is_private || data.is_friend) && (
          <>
            {/* Filter tabs */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              {[
                { key: "all",  label: `All (${items.length})` },
                { key: "game", label: `🎮 Games (${gameCount})` },
                { key: "book", label: `📚 Books (${bookCount})` },
              ].map(({ key, label }) => (
                <button key={key} onClick={() => setFilter(key)} style={{
                  padding: "7px 16px", borderRadius: "20px", cursor: "pointer",
                  border: filter === key ? "none" : "1px solid var(--block-border)",
                  background: filter === key ? "linear-gradient(135deg,#7c3aed,#5b21b6)" : "transparent",
                  color: filter === key ? "white" : "var(--text-color)",
                  fontWeight: "700", fontSize: "12px", opacity: filter === key ? 1 : 0.55,
                }}>{label}</button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px",
                color: "var(--text-color)", opacity: 0.3 }}>
                <div style={{ fontSize: "40px", marginBottom: "10px" }}>📭</div>
                <p style={{ margin: 0, fontSize: "13px" }}>Nothing here yet</p>
              </div>
            ) : (
              <div style={{ display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px,1fr))", gap: "14px" }}>
                {filtered.map((item, i) => {
                  const accent = TYPE_ACCENT[item.type] ?? "#7c3aed";
                  return (
                    <div key={item.id} style={{
                      borderRadius: "16px",
                      border: "1px solid var(--block-border)",
                      background: "var(--block-bg)", overflow: "hidden",
                      animation: `fadeUp 0.3s ease ${i * 0.03}s both`,
                    }}>
                      <div style={{
                        height: "130px",
                        background: item.cover_url
                          ? `url(${item.cover_url}) center/cover no-repeat`
                          : `${accent}18`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "36px", position: "relative",
                      }}>
                        {!item.cover_url && (TYPE_EMOJI[item.type] ?? "📄")}
                        <div style={{
                          position: "absolute", top: "8px", left: "8px",
                          padding: "2px 8px", borderRadius: "20px",
                          background: "rgba(0,0,0,0.55)", color: accent,
                          fontSize: "10px", fontWeight: "700",
                        }}>
                          {TYPE_EMOJI[item.type]} {item.type}
                        </div>
                      </div>
                      <div style={{ padding: "10px 12px" }}>
                        <p style={{ color: "var(--text-color)", fontWeight: "700", fontSize: "13px",
                          margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis",
                          whiteSpace: "nowrap" }}>{item.name}</p>
                        {item.rating && (
                          <p style={{ color: "#f59e0b", fontSize: "11px", margin: 0 }}>
                            {"★".repeat(Math.min(item.rating, 5))} {item.rating}/10
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default UserProfilePage;