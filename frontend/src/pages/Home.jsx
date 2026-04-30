import { useEffect, useState, useCallback } from "react";
import { getItems, getSongs, getStats } from "../services/api";
import ChromaGrid from "../components/ChromaGrid";

const STYLES = `
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50%       { opacity: 1; }
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
.home-card { animation: fadeUp 0.5s ease both; }
.home-card:nth-child(1) { animation-delay: 0.05s; }
.home-card:nth-child(2) { animation-delay: 0.12s; }
.home-card:nth-child(3) { animation-delay: 0.19s; }
.home-card:nth-child(4) { animation-delay: 0.26s; }
.home-card:nth-child(5) { animation-delay: 0.33s; }

@media (max-width: 900px) {
  .home-main-grid { grid-template-columns: 1fr !important; }
  .home-music-grid { grid-template-columns: 1fr !important; }
  .home-bottom-grid { grid-template-columns: 1fr !important; }
}
@media (max-width: 600px) {
  .home-pills { grid-template-columns: 1fr 1fr !important; }
}
`;

const TYPE_COLORS = {
  game: "#7c3aed", book: "#10b981", movie: "#f59e0b", anime: "#ef4444",
};

const SongRow = ({ song }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: "10px",
    padding: "8px 10px", borderRadius: "10px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid var(--block-border)",
    marginBottom: "6px",
  }}>
    {song.cover_url
      ? <img src={song.cover_url} alt={song.title}
          style={{ width: "36px", height: "36px", borderRadius: "6px", objectFit: "cover", flexShrink: 0 }} />
      : <div style={{ width: "36px", height: "36px", borderRadius: "6px",
          background: "linear-gradient(135deg,#7c3aed33,#10b98133)", flexShrink: 0 }} />
    }
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ color: "var(--text-color)", fontWeight: "700", fontSize: "13px",
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{song.title}</div>
      <div style={{ color: "var(--text-color)", opacity: 0.5, fontSize: "11px" }}>{song.artist}</div>
    </div>
    {song.link && (
      <a href={song.link} target="_blank" rel="noreferrer"
        style={{ background: "#1db954", color: "white", borderRadius: "5px",
          padding: "4px 10px", fontSize: "12px", textDecoration: "none",
          fontWeight: "700", flexShrink: 0, whiteSpace: "nowrap" }}>
        ▶
      </a>
    )}
  </div>
);

const Block = ({ title, children, minHeight = "280px", style = {}, accent }) => (
  <div className="home-card" style={{
    background: "var(--block-bg)", backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)", borderRadius: "20px",
    border: "1px solid var(--block-border)", padding: "22px",
    minHeight, boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
    transition: "box-shadow 0.25s, transform 0.25s",
    overflow: "hidden", position: "relative", ...style,
  }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 36px rgba(0,0,0,0.13), 0 0 0 1px ${accent || "#7c3aed"}33`; e.currentTarget.style.transform = "translateY(-2px)"; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.07)"; e.currentTarget.style.transform = "none"; }}
  >
    {accent && <div style={{ position: "absolute", top: 0, left: "24px", right: "24px",
      height: "2px", borderRadius: "0 0 4px 4px",
      background: `linear-gradient(90deg, ${accent}, transparent)`, opacity: 0.6 }} />}
    <h5 style={{ color: "var(--text-color)", marginBottom: "16px", fontWeight: "800",
      fontSize: "14px", letterSpacing: "0.2px" }}>
      {title}
    </h5>
    {children}
  </div>
);

const StatPill = ({ emoji, value, label, color }) => (
  <div className="home-card" style={{
    background: "var(--block-bg)", backdropFilter: "blur(14px)",
    borderRadius: "16px", border: "1px solid var(--block-border)",
    padding: "18px 22px", display: "flex", alignItems: "center",
    gap: "14px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", transition: "transform 0.2s",
  }}
    onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
    onMouseLeave={e => e.currentTarget.style.transform = "none"}
  >
    <div style={{ width: "44px", height: "44px", borderRadius: "12px", flexShrink: 0,
      background: color + "22", display: "flex", alignItems: "center",
      justifyContent: "center", fontSize: "22px" }}>{emoji}</div>
    <div>
      <div style={{ color: "var(--text-color)", fontWeight: "900", fontSize: "24px", lineHeight: 1 }}>{value}</div>
      <div style={{ color: "var(--text-color)", opacity: 0.5, fontSize: "12px", marginTop: "3px" }}>{label}</div>
    </div>
  </div>
);

const EmptyState = ({ emoji = "✦", text }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", height: "150px", color: "var(--text-color)",
    opacity: 0.35, fontSize: "13px", gap: "8px" }}>
    <span style={{ fontSize: "28px", animation: "pulse 2.5s ease infinite" }}>{emoji}</span>
    {text}
  </div>
);

const Loader = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "150px" }}>
    <div style={{ width: "28px", height: "28px", borderRadius: "50%",
      border: "3px solid var(--block-border)", borderTopColor: "#7c3aed",
      animation: "spin 0.8s linear infinite" }} />
  </div>
);

const Home = () => {
  const [games, setGames]       = useState([]);
  const [books, setBooks]       = useState([]);
  const [topSongs, setTopSongs] = useState([]);
  const [yearSongs, setYearSongs] = useState([]);
  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [theme, setTheme]       = useState(document.documentElement.getAttribute("data-theme") || "light");
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.getAttribute("data-theme") || "light");
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [g, b, ys, allTop100, statsData] = await Promise.all([
      getItems("game", 6, "completed"),
      getItems("book", 6, "completed"),
      getSongs("yearly", currentYear),
      getSongs("top100"),
      getStats(),
    ]);
    setGames(g);
    setBooks(b);
    setYearSongs(ys);
    setTopSongs(allTop100.slice(0, 5));
    setStats(statsData);
    setLoading(false);
  }, [currentYear]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const isDark = theme === "dark";

  const toGridItems = (items, isGame) => items.map(item => ({
    image: item.cover_url || `https://via.placeholder.com/300x200/170d27/ffffff?text=${encodeURIComponent(item.name)}`,
    title: item.name,
    subtitle: item.finished_date ? `📅 ${item.finished_date}` : "No date",
    handle: item.rating ? `⭐ ${item.rating}/10` : "No rating",
    borderColor: isGame ? "#7c3aed" : "#10B981",
    gradient: isGame
      ? isDark ? "linear-gradient(145deg, #1a0533, #000)" : "linear-gradient(145deg, #ede9fe, #f5f3ff)"
      : isDark ? "linear-gradient(145deg, #0a2e1a, #000)" : "linear-gradient(145deg, #d1fae5, #f0fdf4)",
  }));

  const totalItems = games.length + books.length;

  return (
    <>
      <style>{STYLES}</style>
      <div style={{ padding: "16px 0 60px" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: "36px", animation: "fadeUp 0.5s ease both" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "5px 14px", borderRadius: "20px", marginBottom: "16px",
            background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)",
          }}>
            <span style={{ width: "7px", height: "7px", borderRadius: "50%",
              background: "#10b981", animation: "pulse 2s ease infinite" }} />
            <span style={{ color: "#7c3aed", fontSize: "12px", fontWeight: "700", letterSpacing: "0.5px" }}>
              YOUR PERSONAL DIARY
            </span>
          </div>
          <h1 style={{ color: "var(--text-color)", fontSize: "clamp(28px, 5vw, 42px)",
            fontWeight: "900", margin: "0 0 10px", letterSpacing: "-1px", lineHeight: 1.1 }}>
            🌐 Web Diary
          </h1>
          <p style={{ color: "var(--text-color)", opacity: 0.45, fontSize: "15px", margin: 0 }}>
            Everything you've played, read & listened to — in one place
          </p>
        </div>

        {/* Stat pills */}
        <div className="home-pills" style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
          gap: "12px", marginBottom: "24px",
        }}>
        <StatPill emoji="✅" value={stats?.total ?? (games.length + books.length)}  label="Total completed" color="#7c3aed" />
        <StatPill emoji="📚" value={stats?.by_type?.find(t => t.type === "book")?.count ?? books.length} label="Books finished"  color="#10b981" />
        <StatPill emoji="🎮" value={stats?.by_type?.find(t => t.type === "game")?.count ?? games.length} label="Games completed" color="#7c3aed" />
        <StatPill emoji="⭐" value={stats?.avg_rating ?? (() => {
          const rated = [...games, ...books].filter(i => i.rating);
          return rated.length ? (rated.reduce((s, i) => s + i.rating, 0) / rated.length).toFixed(1) : "—";
        })()} label="Avg rating" color="#f59e0b" />
        </div>

        {/* Games | Music | Books */}
        <div className="home-main-grid" style={{
          display: "grid", gridTemplateColumns: "1fr 280px 1fr",
          gap: "16px", marginBottom: "16px",
        }}>
          <Block title="🎮 Completed Games" accent="#7c3aed" minHeight="320px">
            {loading ? <Loader /> : games.length === 0
              ? <EmptyState emoji="🎮" text="No games completed yet" />
              : <ChromaGrid items={toGridItems(games, true)} columns={3} rows={2} radius={250} />
            }
          </Block>

          {/* Center column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <Block title="🔥 Top Picks" accent="#f59e0b" minHeight="auto" style={{ flex: 1 }}>
              {loading ? <Loader /> : topSongs.length === 0
                ? <EmptyState emoji="🎵" text="Add songs to Top 100" />
                : topSongs.map(s => <SongRow key={s.id} song={s} />)
              }
            </Block>

            <Block title={`🗓 Top Songs ${currentYear}`} accent="#10b981" minHeight="auto" style={{ flex: 1 }}>
              {loading ? <Loader /> : yearSongs.length === 0
                ? <EmptyState emoji="🎶" text={`No songs for ${currentYear}`} />
                : yearSongs.map(s => <SongRow key={s.id} song={s} />)
              }
            </Block>

            {/* Quick links */}
            <div className="home-card" style={{
              background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(16,185,129,0.08))",
              borderRadius: "16px", border: "1px solid var(--block-border)",
              padding: "16px", display: "flex", flexDirection: "column", gap: "8px",
            }}>
              <p style={{ color: "var(--text-color)", opacity: 0.5, fontSize: "11px",
                fontWeight: "700", letterSpacing: "0.6px", margin: 0 }}>QUICK LINKS</p>
              {[
                { label: "📋 My Completed List", href: "/completed" },
                { label: "🔍 Browse Catalog",    href: "/catalog" },
                { label: "🤖 AI Suggestions",    href: "/suggestions" },
              ].map(({ label, href }) => (
                <a key={href} href={href} style={{
                  display: "block", padding: "8px 12px", borderRadius: "10px",
                  background: "rgba(255,255,255,0.04)", border: "1px solid var(--block-border)",
                  color: "var(--text-color)", textDecoration: "none", fontSize: "13px",
                  fontWeight: "600", transition: "background 0.2s",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(124,58,237,0.12)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                >{label}</a>
              ))}
            </div>
          </div>

          <Block title="📚 Completed Books" accent="#10b981" minHeight="320px">
            {loading ? <Loader /> : books.length === 0
              ? <EmptyState emoji="📚" text="No books completed yet" />
              : <ChromaGrid items={toGridItems(books, false)} columns={3} rows={2} radius={250} />
            }
          </Block>
        </div>

        {/* By Category */}
        {stats && stats.total > 0 && (
          <Block title="🗂 By Category" accent="#7c3aed" minHeight="auto" style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {stats.by_type.map(t => {
                const color = TYPE_COLORS[t.type] || "#7c3aed";
                const max = Math.max(...stats.by_type.map(x => x.count), 1);
                return (
                  <div key={t.type}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ color: "var(--text-color)", fontWeight: "700",
                        fontSize: "13px", textTransform: "capitalize" }}>{t.type}</span>
                      <span style={{ color: "var(--text-color)", opacity: 0.5, fontSize: "12px" }}>
                        {t.count} · {t.avg_rating ? `⭐ ${t.avg_rating}` : "—"}
                      </span>
                    </div>
                    <div style={{ background: "var(--block-border)", borderRadius: "6px", height: "8px" }}>
                      <div style={{ width: `${(t.count / max) * 100}%`, height: "100%",
                        borderRadius: "6px", background: color, transition: "width 0.8s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Block>
        )}

        {/* Empty state */}
        {!loading && totalItems === 0 && (
          <div className="home-card" style={{
            textAlign: "center", padding: "40px 20px",
            background: "var(--block-bg)", backdropFilter: "blur(14px)",
            borderRadius: "20px", border: "1px dashed var(--block-border)",
          }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>🚀</div>
            <h3 style={{ color: "var(--text-color)", fontWeight: "800", margin: "0 0 8px" }}>
              Your diary is empty — let's fill it!
            </h3>
            <p style={{ color: "var(--text-color)", opacity: 0.45, fontSize: "14px", margin: "0 0 20px" }}>
              Head to the Completed page to add your first game or book.
            </p>
            <a href="/completed" style={{
              display: "inline-block", padding: "12px 28px", borderRadius: "12px",
              background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
              color: "white", fontWeight: "700", fontSize: "14px", textDecoration: "none",
            }}>➕ Add First Entry</a>
          </div>
        )}

      </div>
    </>
  );
};

export default Home;