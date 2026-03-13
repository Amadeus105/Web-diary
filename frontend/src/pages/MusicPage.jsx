import { useEffect, useState, useCallback } from "react";
import { getSongs, createSong, deleteSong } from "../services/api";
import AnimatedList from "../components/AnimatedList";

const YEARS = Array.from({ length: 17 }, (_, i) => 2010 + i);

const MusicPage = () => {
  const [top100, setTop100] = useState([]);
  const [yearlySongs, setYearlySongs] = useState([]);
  const [selectedYear, setSelectedYear] = useState(2026);

  // Form states
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [link, setLink] = useState("");
  const [rank, setRank] = useState("");

  const [yearTitle, setYearTitle] = useState("");
  const [yearArtist, setYearArtist] = useState("");
  const [yearCoverUrl, setYearCoverUrl] = useState("");
  const [yearLink, setYearLink] = useState("");
  const [yearRank, setYearRank] = useState("");

  const fetchTop100 = async () => {
    const data = await getSongs("top100");
    setTop100(data);
  };

  const fetchYearly = useCallback(async () => {
  const data = await getSongs("yearly", selectedYear);
  setYearlySongs(data);
  }, [selectedYear]);

  useEffect(() => { fetchTop100(); }, []);
  useEffect(() => { fetchYearly(); }, [fetchYearly]);

  const handleAddTop100 = async (e) => {
    e.preventDefault();
    await createSong({ title, artist, cover_url: coverUrl || null, link: link || null, rank: rank ? Number(rank) : null, year: null, list_type: "top100" });
    setTitle(""); setArtist(""); setCoverUrl(""); setLink(""); setRank("");
    fetchTop100();
  };

  const handleAddYearly = async (e) => {
    e.preventDefault();
    await createSong({ title: yearTitle, artist: yearArtist, cover_url: yearCoverUrl || null, link: yearLink || null, rank: yearRank ? Number(yearRank) : null, year: selectedYear, list_type: "yearly" });
    setYearTitle(""); setYearArtist(""); setYearCoverUrl(""); setYearLink(""); setYearRank("");
    fetchYearly();
  };

  const handleDelete = async (id, type) => {
    await deleteSong(id);
    if (type === "top100") fetchTop100();
    else fetchYearly();
  };

  // Format songs for AnimatedList
  const formatSong = (song, type) => (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      {song.rank && <span style={{ minWidth: "28px", color: "#888", fontWeight: "bold" }}>#{song.rank}</span>}
      {song.cover_url
        ? <img src={song.cover_url} alt={song.title} style={{ width: "45px", height: "45px", objectFit: "cover", borderRadius: "6px" }} />
        : <div style={{ width: "45px", height: "45px", background: "#271e37", borderRadius: "6px", flexShrink: 0 }} />
      }
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: "bold", color: "white" }}>{song.title}</div>
        <div style={{ color: "#aaa", fontSize: "13px" }}>{song.artist}</div>
      </div>
      <div style={{ display: "flex", gap: "6px" }}>
        {song.link && (
          <a href={song.link} target="_blank" rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{ background: "#1db954", color: "white", border: "none", borderRadius: "4px", padding: "4px 8px", fontSize: "12px", textDecoration: "none" }}>
            ▶
          </a>
        )}
        <button onClick={(e) => { e.stopPropagation(); handleDelete(song.id, type); }}
          style={{ background: "#ff4444", color: "white", border: "none", borderRadius: "4px", padding: "4px 8px", fontSize: "12px", cursor: "pointer" }}>
          ✕
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "30px" }}>🎵 My Music</h2>

      <div style={{ display: "flex", gap: "40px", flexWrap: "wrap" }}>

        {/* Top 100 Block */}
        <div style={{ flex: 1, minWidth: "400px", background: "#060010", borderRadius: "16px", padding: "24px" }}>
          <h4 style={{ color: "white", marginBottom: "20px" }}>🏆 My Top 100 All Time</h4>

          <form onSubmit={handleAddTop100} style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <input style={inputStyle} placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              <input style={inputStyle} placeholder="Artist" value={artist} onChange={(e) => setArtist(e.target.value)} required />
              <input style={{ ...inputStyle, width: "80px" }} placeholder="Cover URL" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} />
              <input style={{ ...inputStyle, width: "80px" }} placeholder="Link" value={link} onChange={(e) => setLink(e.target.value)} />
              <input style={{ ...inputStyle, width: "50px" }} placeholder="#" type="number" value={rank} onChange={(e) => setRank(e.target.value)} />
              <button type="submit" style={btnStyle}>Add</button>
            </div>
          </form>

          {top100.length === 0
            ? <p style={{ color: "#666" }}>No songs yet</p>
            : <AnimatedList items={top100.map(s => formatSong(s, "top100"))} showGradients enableArrowNavigation displayScrollbar />
          }
        </div>

        {/* Yearly Block */}
        <div style={{ flex: 1, minWidth: "400px", background: "#060010", borderRadius: "16px", padding: "24px" }}>
          <h4 style={{ color: "white", marginBottom: "20px" }}>📅 Top 10 by Year</h4>

          {/* Year switcher */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
            {YEARS.map(year => (
              <button key={year} onClick={() => setSelectedYear(year)}
                style={{
                  padding: "4px 12px", borderRadius: "20px", border: "none", cursor: "pointer", fontSize: "13px",
                  background: selectedYear === year ? "#7c3aed" : "#271e37",
                  color: "white", transition: "background 0.2s"
                }}>
                {year}
              </button>
            ))}
          </div>

          <form onSubmit={handleAddYearly} style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <input style={inputStyle} placeholder="Title" value={yearTitle} onChange={(e) => setYearTitle(e.target.value)} required />
              <input style={inputStyle} placeholder="Artist" value={yearArtist} onChange={(e) => setYearArtist(e.target.value)} required />
              <input style={{ ...inputStyle, width: "80px" }} placeholder="Cover URL" value={yearCoverUrl} onChange={(e) => setYearCoverUrl(e.target.value)} />
              <input style={{ ...inputStyle, width: "80px" }} placeholder="Link" value={yearLink} onChange={(e) => setYearLink(e.target.value)} />
              <input style={{ ...inputStyle, width: "50px" }} placeholder="#" type="number" value={yearRank} onChange={(e) => setYearRank(e.target.value)} />
              <button type="submit" style={btnStyle}>Add</button>
            </div>
          </form>

          {yearlySongs.length === 0
            ? <p style={{ color: "#666" }}>No songs for {selectedYear}</p>
            : <AnimatedList items={yearlySongs.map(s => formatSong(s, "yearly"))} showGradients enableArrowNavigation displayScrollbar />
          }
        </div>

      </div>
    </div>
  );
};

const inputStyle = {
  background: "#170d27",
  border: "1px solid #271e37",
  borderRadius: "6px",
  padding: "8px 12px",
  color: "white",
  flex: 1,
  minWidth: "100px",
};

const btnStyle = {
  background: "#7c3aed",
  color: "white",
  border: "none",
  borderRadius: "6px",
  padding: "8px 16px",
  cursor: "pointer",
  fontWeight: "bold",
};

export default MusicPage;