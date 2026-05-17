import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import BookLoader from "../components/BookLoader";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";
const H = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

const STYLES = `
@keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
`;

const TYPE_ACCENT = {
  game:    "#10b981",
  book:    "#7c3aed",
  movie:   "#ef4444",
  cartoon: "#f59e0b",
  anime:   "#ec4899",
};
const TYPE_EMOJI = {
  game:    "🎮",
  book:    "📚",
  movie:   "🎬",
  cartoon: "🎨",
  anime:   "⛩️",
};

/* ─── Small item card for profile ──────────────────────── */
const ProfileItemCard = ({ item, i }) => {
  const accent = TYPE_ACCENT[item.type] ?? "#7c3aed";
  return (
    <div style={{
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
        {item.status === "wishlist" && (
          <div style={{
            position: "absolute", top: "8px", right: "8px",
            padding: "2px 8px", borderRadius: "20px",
            background: "rgba(0,0,0,0.55)", color: "#f59e0b",
            fontSize: "10px", fontWeight: "700",
          }}>📋</div>
        )}
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
};

/* ─── Collapsible section block ─────────────────────────── */
const SectionBlock = ({ title, accent, emoji, items }) => {
  const [collapsed, setCollapsed] = useState(false);
  if (!items || items.length === 0) return null;
  return (
    <div style={{ marginBottom: "28px" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: "10px",
        marginBottom: "14px", cursor: "pointer",
      }} onClick={() => setCollapsed(c => !c)}>
        <div style={{
          width: "4px", height: "22px", borderRadius: "4px",
          background: `linear-gradient(180deg,${accent},${accent}88)`,
        }} />
        <h3 style={{ margin: 0, color: "var(--text-color)", fontWeight: "800", fontSize: "16px" }}>
          {emoji} {title}
        </h3>
        <span style={{ padding: "2px 10px", borderRadius: "20px", fontSize: "12px",
          background: `${accent}18`, color: accent, fontWeight: "700" }}>
          {items.length}
        </span>
        <span style={{ marginLeft: "auto", color: "var(--text-color)", opacity: 0.35, fontSize: "14px" }}>
          {collapsed ? "▶" : "▼"}
        </span>
      </div>
      {!collapsed && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px,1fr))", gap: "12px" }}>
          {items.map((item, i) => (
            <ProfileItemCard key={item.id} item={item} i={i} />
          ))}
        </div>
      )}
    </div>
  );
};

const UserProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setLoading(true);
    axios.get(`${BASE_URL}/friends/profile/${username}`, { headers: H() })
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [username]);

  if (loading) return <BookLoader text="Loading profile..." />;

  if (!data) return (
    <div style={{ textAlign: "center", padding: "80px", color: "var(--text-color)", opacity: 0.4 }}>
      User not found
    </div>
  );

  const items = data.items || [];

  // Counts per type
  const gameCount    = items.filter(i => i.type === "game").length;
  const bookCount    = items.filter(i => i.type === "book").length;
  const movieCount   = items.filter(i => i.type === "movie").length;
  const cartoonCount = items.filter(i => i.type === "cartoon").length;
  const animeCount   = items.filter(i => i.type === "anime").length;
  const wishlistItems  = items.filter(i => i.status === "wishlist");
  const wishlistCount  = wishlistItems.length;

  // For "All" tab — flat grid
  const filtered =
    filter === "all"      ? items :
    filter === "wishlist" ? wishlistItems :
    items.filter(i => i.type === filter);

  // Sections for "all" view — grouped by type
  const showSections = filter === "all";

  const gameItems    = items.filter(i => i.type === "game");
  const bookItems    = items.filter(i => i.type === "book");
  const movieItems   = items.filter(i => i.type === "movie");
  const cartoonItems = items.filter(i => i.type === "cartoon");
  const animeItems   = items.filter(i => i.type === "anime");

  return (
    <>
      <style>{STYLES}</style>
      <audio ref={audioRef}
        onEnded={() => { setPlaying(false); setProgress(0); }}
        onTimeUpdate={() => {
          if (audioRef.current)
            setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100 || 0);
        }}
      />
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "24px 16px 60px" }}>

        {/* Profile header */}
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

            {/* Stats row */}
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              {gameCount    > 0 && <StatChip value={gameCount}    label="games"    color={TYPE_ACCENT.game} />}
              {bookCount    > 0 && <StatChip value={bookCount}    label="books"    color={TYPE_ACCENT.book} />}
              {movieCount   > 0 && <StatChip value={movieCount}   label="movies"   color={TYPE_ACCENT.movie} />}
              {cartoonCount > 0 && <StatChip value={cartoonCount} label="cartoons" color={TYPE_ACCENT.cartoon} />}
              {animeCount   > 0 && <StatChip value={animeCount}   label="anime"    color={TYPE_ACCENT.anime} />}
              {wishlistCount > 0 && <StatChip value={wishlistCount} label="wishlist" color="#f59e0b" />}
            </div>
          </div>

          {/* Song of the Day */}
          {(() => {
            try {
              const s = data.song_of_day ? JSON.parse(data.song_of_day) : null;
              if (!s) return null;
              const togglePlay = async () => {
                if (playing) { audioRef.current.pause(); setPlaying(false); return; }
                setLoadingPreview(true);
                try {
                  const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(s.title + " " + s.artist)}&media=music&entity=song&limit=1`);
                  const json = await res.json();
                  const url = json.results?.[0]?.previewUrl;
                  if (url) { audioRef.current.src = url; audioRef.current.play(); setPlaying(true); }
                } catch {}
                setLoadingPreview(false);
              };
              return (
                <div style={{
                  background: "var(--block-bg)", borderRadius: "16px",
                  border: "1px solid var(--block-border)", padding: "14px 16px",
                  minWidth: "200px", maxWidth: "260px", flexShrink: 0,
                }}>
                  <p style={{ color: "var(--text-color)", opacity: 0.45, fontSize: "10px",
                    fontWeight: "700", letterSpacing: "0.6px", margin: "0 0 10px" }}>🎵 SONG OF THE DAY</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {s.cover_url
                      ? <img src={s.cover_url} alt={s.title} style={{ width: "40px", height: "40px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }} />
                      : <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "rgba(245,158,11,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>🎵</div>
                    }
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ color: "var(--text-color)", fontWeight: "700", fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</div>
                      <div style={{ color: "var(--text-color)", opacity: 0.5, fontSize: "11px" }}>{s.artist}</div>
                    </div>
                    <button onClick={togglePlay} style={{
                      width: "30px", height: "30px", borderRadius: "50%", border: "none",
                      cursor: "pointer", flexShrink: 0, fontSize: "12px",
                      background: playing ? "#f59e0b" : "rgba(245,158,11,0.15)",
                      color: playing ? "white" : "#f59e0b",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {loadingPreview ? "⏳" : playing ? "⏸" : "▶"}
                    </button>
                  </div>
                  {playing && (
                    <div style={{ marginTop: "8px", background: "var(--block-border)", borderRadius: "4px", height: "2px" }}>
                      <div style={{ width: `${progress}%`, height: "100%", borderRadius: "4px",
                        background: "#f59e0b", transition: "width 0.5s linear" }} />
                    </div>
                  )}
                </div>
              );
            } catch { return null; }
          })()}

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

        {/* Private */}
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

        {/* Items */}
        {(!data.is_private || data.is_friend) && items.length > 0 && (
          <>
            {/* Filter tabs */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
              {[
                { key: "all",      label: `All (${items.length})`,          color: "#7c3aed" },
                ...(gameCount    > 0 ? [{ key: "game",    label: `🎮 Games (${gameCount})`,       color: TYPE_ACCENT.game }]    : []),
                ...(bookCount    > 0 ? [{ key: "book",    label: `📚 Books (${bookCount})`,       color: TYPE_ACCENT.book }]    : []),
                ...(movieCount   > 0 ? [{ key: "movie",   label: `🎬 Movies (${movieCount})`,     color: TYPE_ACCENT.movie }]   : []),
                ...(cartoonCount > 0 ? [{ key: "cartoon", label: `🎨 Cartoons (${cartoonCount})`, color: TYPE_ACCENT.cartoon }] : []),
                ...(animeCount   > 0 ? [{ key: "anime",   label: `⛩️ Anime (${animeCount})`,      color: TYPE_ACCENT.anime }]   : []),
                ...(wishlistCount > 0 ? [{ key: "wishlist", label: `📋 Wishlist (${wishlistCount})`, color: "#f59e0b" }] : []),
              ].map(({ key, label, color }) => (
                <button key={key} onClick={() => setFilter(key)} style={{
                  padding: "7px 16px", borderRadius: "20px", cursor: "pointer",
                  border: filter === key ? "none" : "1px solid var(--block-border)",
                  background: filter === key ? color : "transparent",
                  color: filter === key ? "white" : "var(--text-color)",
                  fontWeight: "700", fontSize: "12px", opacity: filter === key ? 1 : 0.55,
                  transition: "all 0.2s",
                }}>{label}</button>
              ))}
            </div>

            {/* "All" shows sections per type */}
            {showSections ? (
              <>
                <SectionBlock title="Games"    accent={TYPE_ACCENT.game}    emoji="🎮" items={gameItems} />
                <SectionBlock title="Books"    accent={TYPE_ACCENT.book}    emoji="📚" items={bookItems} />
                <SectionBlock title="Movies"   accent={TYPE_ACCENT.movie}   emoji="🎬" items={movieItems} />
                <SectionBlock title="Cartoons" accent={TYPE_ACCENT.cartoon} emoji="🎨" items={cartoonItems} />
                <SectionBlock title="Anime"    accent={TYPE_ACCENT.anime}   emoji="⛩️" items={animeItems} />
                {wishlistCount > 0 && (
                  <SectionBlock title="Wishlist" accent="#f59e0b" emoji="📋" items={wishlistItems} />
                )}
                {items.length === 0 && (
                  <EmptyState />
                )}
              </>
            ) : (
              filtered.length === 0 ? <EmptyState /> : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px,1fr))", gap: "12px" }}>
                  {filtered.map((item, i) => (
                    <ProfileItemCard key={item.id} item={item} i={i} />
                  ))}
                </div>
              )
            )}
          </>
        )}

        {(!data.is_private || data.is_friend) && items.length === 0 && (
          <EmptyState />
        )}
      </div>
    </>
  );
};

const StatChip = ({ value, label, color }) => (
  <div>
    <span style={{ color: "var(--text-color)", fontWeight: "900", fontSize: "20px" }}>{value}</span>
    <span style={{ color, opacity: 0.8, fontSize: "12px", marginLeft: "5px", fontWeight: "600" }}>{label}</span>
  </div>
);

const EmptyState = () => (
  <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-color)", opacity: 0.3 }}>
    <div style={{ fontSize: "40px", marginBottom: "10px" }}>📭</div>
    <p style={{ margin: 0, fontSize: "13px" }}>Nothing here yet</p>
  </div>
);

export default UserProfilePage;
