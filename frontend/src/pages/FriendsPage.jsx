import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL = "http://localhost:8000";
const getToken = () => localStorage.getItem("token");
const H = () => ({ Authorization: `Bearer ${getToken()}` });

const STYLES = `
@keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
`;

const Avatar = ({ username, avatar, size = 40 }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%", flexShrink: 0,
    background: avatar ? `url(${avatar}) center/cover` : "linear-gradient(135deg,#7c3aed,#5b21b6)",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "white", fontWeight: "800", fontSize: size * 0.35,
  }}>
    {!avatar && username?.[0]?.toUpperCase()}
  </div>
);

const Block = ({ children, title, accent, style = {} }) => (
  <div style={{
    background: "var(--block-bg)", backdropFilter: "blur(6px)",
    borderRadius: "20px", border: "1px solid var(--block-border)",
    padding: "22px", boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
    position: "relative", overflow: "hidden", ...style,
  }}>
    {accent && <div style={{
      position: "absolute", top: 0, left: "22px", right: "22px",
      height: "2px", borderRadius: "0 0 4px 4px",
      background: `linear-gradient(90deg,${accent},transparent)`, opacity: 0.7,
    }} />}
    {title && <h4 style={{ color: "var(--text-color)", fontWeight: "800",
      fontSize: "14px", margin: "0 0 16px" }}>{title}</h4>}
    {children}
  </div>
);

const FriendsPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("friends");
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [feed, setFeed] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [f, r, fd] = await Promise.all([
      axios.get(`${BASE_URL}/friends/`, { headers: H() }),
      axios.get(`${BASE_URL}/friends/requests`, { headers: H() }),
      axios.get(`${BASE_URL}/friends/feed`, { headers: H() }),
    ]);
    setFriends(f.data);
    setRequests(r.data);
    setFeed(fd.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const doSearch = async (q) => {
    if (!q.trim()) { setSearchResults([]); return; }
    setSearching(true);
    const res = await axios.get(`${BASE_URL}/friends/search?q=${q}`, { headers: H() });
    setSearchResults(res.data);
    setSearching(false);
  };

  const sendRequest = async (username) => {
    await axios.post(`${BASE_URL}/friends/request/${username}`, {}, { headers: H() });
    doSearch(search);
    fetchAll();
  };

  const acceptRequest = async (id) => {
    await axios.post(`${BASE_URL}/friends/accept/${id}`, {}, { headers: H() });
    fetchAll();
  };

  const removeFriend = async (id) => {
    await axios.delete(`${BASE_URL}/friends/${id}`, { headers: H() });
    fetchAll();
  };

  const tabBtn = (key, label, count) => (
    <button onClick={() => setTab(key)} style={{
      padding: "8px 18px", borderRadius: "30px", cursor: "pointer",
      border: tab === key ? "none" : "1px solid var(--block-border)",
      background: tab === key ? "linear-gradient(135deg,#7c3aed,#5b21b6)" : "transparent",
      color: tab === key ? "white" : "var(--text-color)",
      fontWeight: "700", fontSize: "12px", opacity: tab === key ? 1 : 0.55,
    }}>
      {label}
      {count > 0 && (
        <span style={{ marginLeft: "6px", padding: "1px 6px", borderRadius: "10px", fontSize: "11px",
          background: tab === key ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)" }}>
          {count}
        </span>
      )}
    </button>
  );

  const typeEmoji = (t) => t === "game" ? "🎮" : "📚";

  return (
    <>
      <style>{STYLES}</style>
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px 16px 60px" }}>

        {/* Header */}
        <div style={{ marginBottom: "28px", animation: "fadeUp 0.3s ease" }}>
          <h1 style={{ color: "var(--text-color)", fontWeight: "900",
            fontSize: "clamp(24px,4vw,34px)", letterSpacing: "-0.5px", margin: "0 0 6px" }}>
            👥 Friends
          </h1>
          <p style={{ color: "var(--text-color)", opacity: 0.45, fontSize: "14px", margin: 0 }}>
            Find friends, see their activity, send messages
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "20px", alignItems: "start" }}>

          {/* Left — main content */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Tabs */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {tabBtn("friends", "👥 Friends", friends.length)}
              {tabBtn("requests", "📩 Requests", requests.length)}
              {tabBtn("feed", "📰 Feed", 0)}
            </div>

            {/* Friends list */}
            {tab === "friends" && (
              <Block accent="#7c3aed">
                {loading ? (
                  <p style={{ color: "var(--text-color)", opacity: 0.4, fontSize: "13px" }}>Loading...</p>
                ) : friends.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 20px",
                    color: "var(--text-color)", opacity: 0.3 }}>
                    <div style={{ fontSize: "40px", marginBottom: "10px" }}>👥</div>
                    <p style={{ margin: 0, fontSize: "13px" }}>No friends yet — search to add some!</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {friends.map((f, i) => (
                      <div key={f.id} style={{
                        display: "flex", alignItems: "center", gap: "12px",
                        padding: "10px 12px", borderRadius: "12px",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid var(--block-border)",
                        animation: `fadeUp 0.3s ease ${i * 0.04}s both`,
                      }}>
                        <Avatar username={f.username} avatar={f.avatar_url} />
                        <div style={{ flex: 1 }}>
                          <div style={{ color: "var(--text-color)", fontWeight: "700", fontSize: "14px" }}>
                            {f.username}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button onClick={() => navigate(`/chat/${f.partner_id || f.addressee_id || f.requester_id}`)} style={{
                            padding: "6px 12px", borderRadius: "8px", border: "none",
                            background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
                            color: "white", fontWeight: "700", fontSize: "12px", cursor: "pointer",
                          }}>💬 Chat</button>
                          <button onClick={() => navigate(`/u/${f.username}`)} style={{
                            padding: "6px 12px", borderRadius: "8px",
                            border: "1px solid var(--block-border)", background: "transparent",
                            color: "var(--text-color)", fontWeight: "600", fontSize: "12px", cursor: "pointer",
                          }}>👤 Profile</button>
                          <button onClick={() => removeFriend(f.id)} style={{
                            padding: "6px 10px", borderRadius: "8px",
                            border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)",
                            color: "#ef4444", fontSize: "12px", cursor: "pointer",
                          }}>✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Block>
            )}

            {/* Incoming requests */}
            {tab === "requests" && (
              <Block accent="#f59e0b">
                {requests.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 20px",
                    color: "var(--text-color)", opacity: 0.3 }}>
                    <div style={{ fontSize: "36px", marginBottom: "10px" }}>📩</div>
                    <p style={{ margin: 0, fontSize: "13px" }}>No pending requests</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {requests.map((r) => (
                      <div key={r.id} style={{
                        display: "flex", alignItems: "center", gap: "12px",
                        padding: "10px 12px", borderRadius: "12px",
                        background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)",
                      }}>
                        <Avatar username={r.username} avatar={r.avatar_url} />
                        <div style={{ flex: 1 }}>
                          <div style={{ color: "var(--text-color)", fontWeight: "700", fontSize: "14px" }}>
                            {r.username}
                          </div>
                          <div style={{ color: "var(--text-color)", opacity: 0.45, fontSize: "11px" }}>
                            wants to be friends
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button onClick={() => acceptRequest(r.id)} style={{
                            padding: "7px 14px", borderRadius: "8px", border: "none",
                            background: "linear-gradient(135deg,#10b981,#059669)",
                            color: "white", fontWeight: "700", fontSize: "12px", cursor: "pointer",
                          }}>✓ Accept</button>
                          <button onClick={() => removeFriend(r.id)} style={{
                            padding: "7px 10px", borderRadius: "8px",
                            border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)",
                            color: "#ef4444", fontSize: "12px", cursor: "pointer",
                          }}>✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Block>
            )}

            {/* Feed */}
            {tab === "feed" && (
              <Block accent="#10b981" title="📰 Friends' Activity">
                {feed.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 20px",
                    color: "var(--text-color)", opacity: 0.3 }}>
                    <div style={{ fontSize: "36px", marginBottom: "10px" }}>📰</div>
                    <p style={{ margin: 0, fontSize: "13px" }}>Nothing yet — add friends to see their activity</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {feed.map((a, i) => (
                      <div key={a.id} style={{
                        display: "flex", alignItems: "center", gap: "12px",
                        padding: "10px 12px", borderRadius: "12px",
                        background: "rgba(255,255,255,0.03)", border: "1px solid var(--block-border)",
                        animation: `fadeUp 0.3s ease ${i * 0.04}s both`,
                      }}>
                        <Avatar username={a.username} avatar={a.avatar_url} size={36} />
                        {a.item_cover && (
                          <img src={a.item_cover} alt={a.item_name}
                            style={{ width: "36px", height: "36px", borderRadius: "6px", objectFit: "cover" }} />
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ color: "var(--text-color)", fontSize: "13px" }}>
                            <span style={{ fontWeight: "700" }}>{a.username}</span>
                            {" "}
                            <span style={{ opacity: 0.55 }}>
                              {a.action_type === "completed" ? "completed" : "added to wishlist"}
                            </span>
                            {" "}
                            <span style={{ fontWeight: "700" }}>{a.item_name}</span>
                            {" "}
                            <span style={{ opacity: 0.5 }}>{typeEmoji(a.item_type)}</span>
                          </div>
                          {a.rating && (
                            <div style={{ color: "#f59e0b", fontSize: "11px", marginTop: "2px" }}>
                              {"★".repeat(Math.min(a.rating, 5))} {a.rating}/10
                            </div>
                          )}
                        </div>
                        <span style={{ color: "var(--text-color)", opacity: 0.3, fontSize: "11px", flexShrink: 0 }}>
                          {new Date(a.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Block>
            )}
          </div>

          {/* Right — search */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Block accent="#10b981" title="🔍 Find Friends">
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); doSearch(e.target.value); }}
                placeholder="Search by username..."
                style={{
                  width: "100%", padding: "10px 13px", borderRadius: "10px",
                  border: "1px solid var(--block-border)", background: "rgba(255,255,255,0.04)",
                  color: "var(--text-color)", fontSize: "13px", outline: "none",
                  boxSizing: "border-box", transition: "border-color 0.2s", marginBottom: "12px",
                }}
                onFocus={e => (e.target.style.borderColor = "#10b981")}
                onBlur={e => (e.target.style.borderColor = "var(--block-border)")}
              />

              {searching && (
                <p style={{ color: "var(--text-color)", opacity: 0.4, fontSize: "12px", margin: 0 }}>
                  Searching...
                </p>
              )}

              {searchResults.map(u => (
                <div key={u.id} style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "8px 10px", borderRadius: "10px",
                  background: "rgba(255,255,255,0.03)", border: "1px solid var(--block-border)",
                  marginBottom: "8px",
                }}>
                  <Avatar username={u.username} avatar={u.avatar_url} size={32} />
                  <span style={{ flex: 1, color: "var(--text-color)", fontWeight: "600", fontSize: "13px" }}>
                    {u.username}
                  </span>
                  {!u.friendship_status && (
                    <button onClick={() => sendRequest(u.username)} style={{
                      padding: "5px 10px", borderRadius: "7px", border: "none",
                      background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
                      color: "white", fontWeight: "700", fontSize: "11px", cursor: "pointer",
                    }}>+ Add</button>
                  )}
                  {u.friendship_status === "pending" && (
                    <span style={{ color: "#f59e0b", fontSize: "11px", fontWeight: "700" }}>
                      {u.friendship_requester ? "Pending" : "Sent"}
                    </span>
                  )}
                  {u.friendship_status === "accepted" && (
                    <span style={{ color: "#10b981", fontSize: "11px", fontWeight: "700" }}>✓ Friends</span>
                  )}
                </div>
              ))}

              {search && !searching && searchResults.length === 0 && (
                <p style={{ color: "var(--text-color)", opacity: 0.35, fontSize: "12px", margin: 0 }}>
                  No users found for "{search}"
                </p>
              )}
            </Block>
          </div>

        </div>
      </div>
    </>
  );
};

export default FriendsPage;