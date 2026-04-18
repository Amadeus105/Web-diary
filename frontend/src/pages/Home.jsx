import { useEffect, useState, useCallback } from "react";
import { getItems, getSongs } from "../services/api";
import ChromaGrid from "../components/ChromaGrid";
import AnimatedList from "../components/AnimatedList";

const SongRow = ({ song }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
    {song.cover_url
      ? <img src={song.cover_url} alt={song.title} style={{ width: "40px", height: "40px", borderRadius: "6px", objectFit: "cover" }} />
      : <div style={{ width: "40px", height: "40px", borderRadius: "6px", background: "var(--block-border)", flexShrink: 0 }} />
    }
    <div style={{ flex: 1 }}>
      <div style={{ color: "var(--text-color)", fontWeight: "bold", fontSize: "13px" }}>{song.title}</div>
      <div style={{ color: "var(--text-color)", opacity: 0.6, fontSize: "11px" }}>{song.artist}</div>
    </div>
    {song.link && (
      <a href={song.link} target="_blank" rel="noreferrer"
        onClick={e => e.stopPropagation()}
        style={{ background: "#1db954", color: "white", borderRadius: "4px", padding: "3px 8px", fontSize: "11px", textDecoration: "none" }}>
        ▶
      </a>
    )}
  </div>
);

const Block = ({ title, children, minHeight = "300px" }) => (
  <div style={{
    background: "var(--block-bg)",
    backdropFilter: "blur(12px)",
    borderRadius: "20px",
    border: "1px solid var(--block-border)",
    padding: "24px",
    minHeight,
    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
    transition: "box-shadow 0.2s",
  }}>
    <h5 style={{ color: "var(--text-color)", marginBottom: "16px", fontWeight: "700", fontSize: "15px" }}>{title}</h5>
    {children}
  </div>
);

const EmptyState = ({ text }) => (
  <div style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "150px",
    color: "var(--text-color)",
    opacity: 0.4,
    fontSize: "14px",
    gap: "8px"
  }}>
    <span style={{ fontSize: "32px" }}>✦</span>
    {text}
  </div>
);

const Home = () => {
  const [games, setGames] = useState([]);
  const [books, setBooks] = useState([]);
  const [todaySongs, setTodaySongs] = useState([]);
  const [yearSongs, setYearSongs] = useState([]);
  const currentYear = new Date().getFullYear();

  const fetchData = useCallback(async () => {
    const [g, b, ys, allTop100] = await Promise.all([
      getItems("game", 6),
      getItems("book", 6),
      getSongs("yearly", currentYear),
      getSongs("top100"),
    ]);
    setGames(g);
    setBooks(b);
    setYearSongs(ys);
    setTodaySongs(allTop100.slice(0, 3));
  }, [currentYear]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toGridItems = (items, isGame) => items.map(item => ({
    image: item.cover_url || `https://via.placeholder.com/300x200/170d27/ffffff?text=${encodeURIComponent(item.name)}`,
    title: item.name,
    subtitle: item.finished_date ? `📅 ${item.finished_date}` : "No date",
    handle: item.rating ? `⭐ ${item.rating}/10` : "No rating",
    borderColor: isGame ? "#7c3aed" : "#10B981",
    gradient: isGame
      ? "linear-gradient(145deg, #1a0533, #000)"
      : "linear-gradient(145deg, #0a2e1a, #000)",
  }));

  return (
    <div style={{ padding: "10px 0 40px 0" }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h2 style={{
          color: "var(--text-color)",
          fontSize: "32px",
          fontWeight: "800",
          margin: 0,
          letterSpacing: "-0.5px"
        }}>
          🌐 Welcome to Web Diary
        </h2>
        <p style={{ color: "var(--text-color)", opacity: 0.5, marginTop: "8px", fontSize: "15px" }}>
          Track your games, books and music
        </p>
      </div>

      {/* Main grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr 2fr",
        gap: "20px",
        marginBottom: "20px"
      }}>

        {/* Games Block */}
        <Block title="🎮 Completed Games">
          {games.length === 0
            ? <EmptyState text="No games completed yet" />
            : <ChromaGrid items={toGridItems(games, true)} columns={3} rows={2} radius={250} />
          }
        </Block>

        {/* Songs Block */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Block title="🎵 My Top Picks" minHeight="140px">
            {todaySongs.length === 0
              ? <EmptyState text="Add songs to Top 100 first" />
              : <AnimatedList
                  items={todaySongs.map(s => <SongRow song={s} />)}
                  showGradients
                  displayScrollbar={false}
                />
            }
          </Block>

          <Block title={`🎵 Top Songs ${currentYear}`} minHeight="140px">
            {yearSongs.length === 0
              ? <EmptyState text={`No songs for ${currentYear} yet`} />
              : <AnimatedList
                  items={yearSongs.map(s => <SongRow song={s} />)}
                  showGradients
                  displayScrollbar={false}
                />
            }
          </Block>
        </div>

        {/* Books Block */}
        <Block title="📚 Completed Books">
          {books.length === 0
            ? <EmptyState text="No books completed yet" />
            : <ChromaGrid items={toGridItems(books, false)} columns={3} rows={2} radius={250} />
          }
        </Block>

      </div>
    </div>
  );
};

export default Home;