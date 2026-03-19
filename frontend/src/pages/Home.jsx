import { useEffect, useState, useCallback } from "react";
import { getItems } from "../services/api";
import { getSongs } from "../services/api";
import ChromaGrid from "../components/ChromaGrid";
import AnimatedList from "../components/AnimatedList";

const SongRow = ({ song }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
    {song.cover_url
      ? <img src={song.cover_url} alt={song.title} style={{ width: "40px", height: "40px", borderRadius: "6px", objectFit: "cover" }} />
      : <div style={{ width: "40px", height: "40px", borderRadius: "6px", background: "#271e37", flexShrink: 0 }} />
    }
    <div style={{ flex: 1 }}>
      <div style={{ color: "white", fontWeight: "bold", fontSize: "13px" }}>{song.title}</div>
      <div style={{ color: "#aaa", fontSize: "11px" }}>{song.artist}</div>
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
    background: "var(--block-bg, rgba(0,0,0,0.05))",
    backdropFilter: "blur(10px)",
    borderRadius: "16px",
    border: "1px solid var(--block-border, rgba(0,0,0,0.1))",
    padding: "20px",
    minHeight,
  }}>
    <h5 style={{ color: "var(--text-color)", marginBottom: "16px", fontWeight: "600" }}>{title}</h5>
    {children}
  </div>
);

const Home = () => {
  const [games, setGames] = useState([]);
  const [books, setBooks] = useState([]);
  const [todaySongs, setTodaySongs] = useState([]);
  const [yearSongs, setYearSongs] = useState([]);
  const currentYear = new Date().getFullYear();
  const today = new Date().toISOString().split("T")[0];

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

  // Top 3 from top100 as "today's picks"
  setTodaySongs(allTop100.slice(0, 3));
}, [currentYear]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Format for ChromaGrid
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
    <div style={{ padding: "10px 0" }}>
      <h2 style={{ color: "var(--text-color)", textAlign: "center", marginBottom: "30px", fontSize: "28px" }}>
        🎮 Welcome to Completed Diary
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 2fr", gap: "20px", marginBottom: "20px" }}>

        {/* Games Block */}
        <Block title="🎮 Completed Games (Recently)">
          {games.length === 0
            ? <p style={{ color: "#666" }}>No games completed yet</p>
            : <ChromaGrid items={toGridItems(games, true)} columns={3} rows={2} radius={250} />
          }
        </Block>

        {/* Songs Block */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
<Block title="🎵 My Top Picks" minHeight="140px">
  {todaySongs.length === 0
    ? <p style={{ color: "var(--text-color)", opacity: 0.5, fontSize: "13px" }}>
        Add songs to your Top 100 first
      </p>
    : <AnimatedList
        items={todaySongs.map(s => <SongRow song={s} />)}
        showGradients
        displayScrollbar={false}
      />
  }
</Block>

          <Block title={`🎵 Top Songs ${currentYear}`} minHeight="140px">
            {yearSongs.length === 0
              ? <p style={{ color: "#666", fontSize: "13px" }}>No songs for {currentYear} yet</p>
              : <AnimatedList
                  items={yearSongs.map(s => <SongRow song={s} />)}
                  showGradients
                  displayScrollbar={false}
                />
            }
          </Block>
        </div>

        {/* Books Block */}
        <Block title="📚 Completed Books (Recently Read)">
          {books.length === 0
            ? <p style={{ color: "#666" }}>No books completed yet</p>
            : <ChromaGrid items={toGridItems(books, false)} columns={3} rows={2} radius={250} />
          }
        </Block>

      </div>
    </div>
  );
};

export default Home;