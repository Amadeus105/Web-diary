import { useEffect, useState, useCallback, useRef } from "react";
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
}
@media (max-width: 600px) {
  .home-pills { grid-template-columns: 1fr 1fr !important; }
}
`;

const TYPE_COLORS = {
  game: "#7c3aed", book: "#10b981", movie: "#ef4444", cartoon: "#f59e0b", anime: "#ec4899",
};

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
    <h5 style={{ color: "var(--text-color)", marginBottom: "16px", fontWeight: "800", fontSize: "14px" }}>
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

/* ── Song of the Day + Today's Listen ── */
const SongOfDayWidget = ({ top100 }) => {
  const today = new Date().toDateString();

  const [todayListen, setTodayListen] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("todayListen") || "null");
      return saved?.date === today ? saved.song : null;
    } catch { return null; }
  });

  const [search, setSearch]       = useState("");
  const [results, setResults]     = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const audioRef  = useRef(null);
  const [playing, setPlaying]   = useState(false);
  const [progress, setProgress] = useState(0);

const dayOfYear = Math.floor(
  (new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
);
const songOfDay = top100.length > 0 ? top100[dayOfYear % top100.length] : null;

  useEffect(() => {
    if (!search.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res  = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(search)}&media=music&entity=song&limit=5`);
        const data = await res.json();
        setResults(data.results || []);
      } catch { setResults([]); }
      setSearching(false);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const saveTodayListen = (track) => {
    const song = {
      title:      track.trackName,
      artist:     track.artistName,
      cover_url:  track.artworkUrl100?.replace("100x100bb", "300x300bb"),
      previewUrl: track.previewUrl,
      link:       track.trackViewUrl,
    };
    localStorage.setItem("todayListen", JSON.stringify({ date: today, song }));
    setTodayListen(song);
    setSearch(""); setResults([]); setShowSearch(false);
  };

  const clearToday = () => {
    localStorage.removeItem("todayListen");
    setTodayListen(null);
    if (audioRef.current) { audioRef.current.pause(); setPlaying(false); }
  };

  const togglePlay = (url) => {
    if (!url) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.src = url;
      audioRef.current.play();
      setPlaying(true);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <audio ref={audioRef}
        onEnded={() => { setPlaying(false); setProgress(0); }}
        onTimeUpdate={() => {
          if (audioRef.current)
            setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100 || 0);
        }}
      />

      {/* Song of the Day */}
      <div className="home-card" style={{
        background: "var(--block-bg)", backdropFilter: "blur(14px)",
        borderRadius: "20px", border: "1px solid var(--block-border)",
        padding: "18px", position: "relative", overflow: "hidden",
        boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
      }}>
        <div style={{ position: "absolute", top: 0, left: "20px", right: "20px", height: "2px",
          background: "linear-gradient(90deg,#f59e0b,transparent)", borderRadius: "0 0 4px 4px" }} />
        <p style={{ color: "var(--text-color)", opacity: 0.5, fontSize: "11px",
          fontWeight: "700", letterSpacing: "0.6px", margin: "0 0 14px" }}>🎵 SONG OF THE DAY</p>

        {!songOfDay ? (
          <p style={{ color: "var(--text-color)", opacity: 0.3, fontSize: "13px", margin: 0 }}>
            Add songs to Top 100 first
          </p>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {songOfDay.cover_url
              ? <img src={songOfDay.cover_url} alt={songOfDay.title}
                  style={{ width: "52px", height: "52px", borderRadius: "10px", objectFit: "cover", flexShrink: 0 }} />
              : <div style={{ width: "52px", height: "52px", borderRadius: "10px", flexShrink: 0,
                  background: "linear-gradient(135deg,#f59e0b33,#7c3aed33)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>🎵</div>
            }
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: "var(--text-color)", fontWeight: "800", fontSize: "14px",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{songOfDay.title}</div>
              <div style={{ color: "var(--text-color)", opacity: 0.5, fontSize: "12px" }}>{songOfDay.artist}</div>
            </div>
            {songOfDay.link && (
              <a href={songOfDay.link} target="_blank" rel="noreferrer"
                style={{ background: "#1db954", color: "white", borderRadius: "8px",
                  padding: "5px 12px", fontSize: "12px", textDecoration: "none",
                  fontWeight: "700", flexShrink: 0 }}>▶</a>
            )}
          </div>
        )}
      </div>

      {/* Today's Listen */}
      <div className="home-card" style={{
        background: "var(--block-bg)", backdropFilter: "blur(14px)",
        borderRadius: "20px", border: "1px solid var(--block-border)",
        padding: "16px", boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <p style={{ color: "var(--text-color)", opacity: 0.5, fontSize: "11px",
            fontWeight: "700", letterSpacing: "0.6px", margin: 0 }}>🎧 TODAY'S LISTEN</p>
          {!todayListen && (
            <button onClick={() => setShowSearch(!showSearch)} style={{
              background: showSearch ? "rgba(124,58,237,0.25)" : "rgba(124,58,237,0.12)",
              border: "none", cursor: "pointer", color: "#7c3aed",
              fontSize: "11px", fontWeight: "700", borderRadius: "6px", padding: "4px 10px",
            }}>+ Add</button>
          )}
          {todayListen && (
            <button onClick={clearToday} style={{ background: "none", border: "none",
              cursor: "pointer", color: "var(--text-color)", opacity: 0.3, fontSize: "16px" }}>✕</button>
          )}
        </div>

        {todayListen ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {todayListen.cover_url
                ? <img src={todayListen.cover_url} alt={todayListen.title}
                    style={{ width: "44px", height: "44px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }} />
                : <div style={{ width: "44px", height: "44px", borderRadius: "8px", flexShrink: 0,
                    background: "linear-gradient(135deg,#7c3aed33,#10b98133)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>🎵</div>
              }
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: "var(--text-color)", fontWeight: "700", fontSize: "13px",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{todayListen.title}</div>
                <div style={{ color: "var(--text-color)", opacity: 0.5, fontSize: "11px" }}>{todayListen.artist}</div>
              </div>
              {todayListen.previewUrl && (
                <button onClick={() => togglePlay(todayListen.previewUrl)} style={{
                  width: "32px", height: "32px", borderRadius: "50%", border: "none", cursor: "pointer",
                  background: playing ? "#7c3aed" : "rgba(124,58,237,0.15)",
                  color: playing ? "white" : "#7c3aed", fontSize: "13px", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s",
                }}>{playing ? "⏸" : "▶"}</button>
              )}
            </div>
            {playing && (
              <div style={{ marginTop: "8px", background: "var(--block-border)", borderRadius: "3px", height: "2px" }}>
                <div style={{ width: `${progress}%`, height: "100%", borderRadius: "3px",
                  background: "linear-gradient(90deg,#7c3aed,#10b981)", transition: "width 0.5s linear" }} />
              </div>
            )}
            <p style={{ color: "var(--text-color)", opacity: 0.25, fontSize: "10px", margin: "8px 0 0" }}>
              disappears tomorrow ✦
            </p>
          </>
        ) : (
          <>
            {showSearch ? (
              <div style={{ position: "relative" }}>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search on iTunes..."
                  autoFocus
                  style={{ width: "100%", background: "rgba(255,255,255,0.05)",
                    border: "1px solid var(--block-border)", borderRadius: "10px",
                    padding: "8px 12px", color: "var(--text-color)", outline: "none",
                    fontSize: "13px", boxSizing: "border-box" }}
                />
                {searching && (
                  <div style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)",
                    width: "14px", height: "14px", borderRadius: "50%",
                    border: "2px solid var(--block-border)", borderTopColor: "#7c3aed",
                    animation: "spin 0.8s linear infinite" }} />
                )}
                {results.length > 0 && (
                  <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 300,
                    background: "var(--block-bg)", backdropFilter: "blur(20px)",
                    borderRadius: "12px", border: "1px solid var(--block-border)",
                    boxShadow: "0 12px 40px rgba(0,0,0,0.25)", overflow: "hidden" }}>
                    {results.map(t => (
                      <div key={t.trackId} onClick={() => saveTodayListen(t)} style={{
                        display: "flex", alignItems: "center", gap: "10px",
                        padding: "10px 14px", cursor: "pointer",
                        borderBottom: "1px solid var(--block-border)", transition: "background 0.15s",
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(124,58,237,0.08)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <img src={t.artworkUrl100} alt={t.trackName}
                          style={{ width: "36px", height: "36px", borderRadius: "6px", objectFit: "cover", flexShrink: 0 }} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ color: "var(--text-color)", fontWeight: "700", fontSize: "12px",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.trackName}</div>
                          <div style={{ color: "var(--text-color)", opacity: 0.5, fontSize: "11px" }}>{t.artistName}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p style={{ color: "var(--text-color)", opacity: 0.3, fontSize: "13px", margin: 0 }}>
                What are you listening to today?
              </p>
            )}
          </>
        )}
      </div>

      {/* Quick Links */}
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
  );
};

/* ── Main ── */
const Home = () => {
  const [games, setGames]       = useState([]);
  const [books, setBooks]       = useState([]);
  const [movies, setMovies]     = useState([]);
  const [cartoons, setCartoons] = useState([]);
  const [animes, setAnimes]     = useState([]);
  const [top100, setTop100]     = useState([]);
  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [theme, setTheme]       = useState(document.documentElement.getAttribute("data-theme") || "light");

  useEffect(() => {
    const observer = new MutationObserver(() =>
      setTheme(document.documentElement.getAttribute("data-theme") || "light")
    );
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [g, b, mv, ct, an, allTop100, statsData] = await Promise.all([
      getItems("game",    6, "completed"),
      getItems("book",    6, "completed"),
      getItems("movie",   6, "completed"),
      getItems("cartoon", 6, "completed"),
      getItems("anime",   6, "completed"),
      getSongs("top100"),
      getStats(),
    ]);
    setGames(g);
    setBooks(b);
    setMovies(mv);
    setCartoons(ct);
    setAnimes(an);
    setTop100(allTop100);
    setStats(statsData);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const isDark = theme !== "light";

  const toGridItems = (items, color) => items.map(item => ({
    image: item.cover_url || `https://via.placeholder.com/300x200/170d27/ffffff?text=${encodeURIComponent(item.name)}`,
    title: item.name,
    subtitle: item.finished_date ? `📅 ${item.finished_date}` : "No date",
    handle: item.rating ? `⭐ ${item.rating}/10` : "No rating",
    borderColor: color,
    gradient: isDark
      ? `linear-gradient(145deg,#111,#000)`
      : `linear-gradient(145deg,#f5f5ff,#fff)`,
  }));

  const totalItems = games.length + books.length + movies.length + cartoons.length + animes.length;

  return (
    <>
      <style>{STYLES}</style>
      <div style={{ padding: "16px 0 60px" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: "36px", animation: "fadeUp 0.5s ease both" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "5px 14px", borderRadius: "20px", marginBottom: "16px",
            background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}>
            <span style={{ width: "7px", height: "7px", borderRadius: "50%",
              background: "#10b981", animation: "pulse 2s ease infinite" }} />
            <span style={{ color: "#7c3aed", fontSize: "12px", fontWeight: "700", letterSpacing: "0.5px" }}>
              YOUR PERSONAL DIARY
            </span>
          </div>
          <h1 style={{ color: "var(--text-color)", fontSize: "clamp(28px,5vw,42px)",
            fontWeight: "900", margin: "0 0 10px", letterSpacing: "-1px", lineHeight: 1.1 }}>
            🌐 Web Diary
          </h1>
          <p style={{ color: "var(--text-color)", opacity: 0.45, fontSize: "15px", margin: 0 }}>
            Everything you've played, read & listened to — in one place
          </p>
        </div>

        {/* Stat Pills */}
        <div className="home-pills" style={{ display: "grid",
          gridTemplateColumns: "repeat(4,1fr)", gap: "12px", marginBottom: "24px" }}>
          <StatPill emoji="✅" value={stats?.total ?? totalItems} label="Total completed" color="#7c3aed" />
          <StatPill emoji="🎮" value={stats?.by_type?.find(t => t.type === "game")?.count ?? games.length} label="Games" color="#7c3aed" />
          <StatPill emoji="📚" value={stats?.by_type?.find(t => t.type === "book")?.count ?? books.length} label="Books" color="#10b981" />
          <StatPill emoji="⭐" value={stats?.avg_rating ?? (() => {
            const allItems = [...games, ...books, ...movies, ...cartoons, ...animes];
            const rated = allItems.filter(i => i.rating);
            return rated.length ? (rated.reduce((s,i) => s + i.rating, 0) / rated.length).toFixed(1) : "—";
          })()} label="Avg rating" color="#f59e0b" />
        </div>

        {/* Main grid: Games | Song widget | Books */}
        <div className="home-main-grid" style={{ display: "grid",
          gridTemplateColumns: "1fr 280px 1fr", gap: "16px", marginBottom: "16px" }}>

          <Block title="🎮 Completed Games" accent="#7c3aed" minHeight="320px">
            {loading ? <Loader /> : games.length === 0
              ? <EmptyState emoji="🎮" text="No games completed yet" />
              : <ChromaGrid items={toGridItems(games, "#7c3aed")} columns={3} rows={2} radius={250} />}
          </Block>

          <SongOfDayWidget top100={top100} />

          <Block title="📚 Completed Books" accent="#10b981" minHeight="320px">
            {loading ? <Loader /> : books.length === 0
              ? <EmptyState emoji="📚" text="No books completed yet" />
              : <ChromaGrid items={toGridItems(books, "#10b981")} columns={3} rows={2} radius={250} />}
          </Block>
        </div>

        {/* Second row: Movies | Cartoons | Anime */}
        <div className="home-main-grid" style={{ display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>

          <Block title="🎬 Watched Movies" accent="#ef4444" minHeight="260px">
            {loading ? <Loader /> : movies.length === 0
              ? <EmptyState emoji="🎬" text="No movies watched yet" />
              : <ChromaGrid items={toGridItems(movies, "#ef4444")} columns={3} rows={2} radius={250} />}
          </Block>

          <Block title="🎨 Watched Cartoons" accent="#f59e0b" minHeight="260px">
            {loading ? <Loader /> : cartoons.length === 0
              ? <EmptyState emoji="🎨" text="No cartoons watched yet" />
              : <ChromaGrid items={toGridItems(cartoons, "#f59e0b")} columns={3} rows={2} radius={250} />}
          </Block>

          <Block title="⛩️ Watched Anime" accent="#ec4899" minHeight="260px">
            {loading ? <Loader /> : animes.length === 0
              ? <EmptyState emoji="⛩️" text="No anime watched yet" />
              : <ChromaGrid items={toGridItems(animes, "#ec4899")} columns={3} rows={2} radius={250} />}
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

        {/* Empty banner */}
        {!loading && totalItems === 0 && (
          <div className="home-card" style={{ textAlign: "center", padding: "40px 20px",
            background: "var(--block-bg)", backdropFilter: "blur(14px)",
            borderRadius: "20px", border: "1px dashed var(--block-border)" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>🚀</div>
            <h3 style={{ color: "var(--text-color)", fontWeight: "800", margin: "0 0 8px" }}>
              Your diary is empty — let's fill it!
            </h3>
            <p style={{ color: "var(--text-color)", opacity: 0.45, fontSize: "14px", margin: "0 0 20px" }}>
              Head to the Completed page to add your first game or book.
            </p>
            <a href="/completed" style={{ display: "inline-block", padding: "12px 28px",
              borderRadius: "12px", background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
              color: "white", fontWeight: "700", fontSize: "14px", textDecoration: "none" }}>
              ➕ Add First Entry
            </a>
          </div>
        )}
      </div>
    </>
  );
};

export default Home;