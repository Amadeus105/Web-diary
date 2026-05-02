import { useEffect, useState, useCallback, useRef } from "react";
import { getSongs, createSong, deleteSong, setSongOfDay } from "../services/api";

const YEARS = Array.from({ length: 17 }, (_, i) => 2010 + i);
const CURRENT_YEAR = new Date().getFullYear();

const searchITunes = async (query) => {
  if (!query.trim()) return [];
  const res  = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=6`);
  const data = await res.json();
  return data.results || [];
};

const getPreviewUrl = async (title, artist) => {
  try {
    const res  = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(title + " " + artist)}&media=music&entity=song&limit=1`);
    const data = await res.json();
    return data.results?.[0]?.previewUrl || null;
  } catch { return null; }
};

const STYLES = `
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}
.music-card { animation: fadeUp 0.4s ease both; }
`;

const MusicPage = () => {
  const [top100, setTop100]           = useState([]);
  const [yearlySongs, setYearlySongs] = useState([]);
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [activeTab, setActiveTab]     = useState("top100");

  const [searchQuery, setSearchQuery]     = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching]         = useState(false);
  const [showResults, setShowResults]     = useState(false);

  const audioRef = useRef(null);
  const [playingId, setPlayingId]         = useState(null); // trackId (iTunes) or songId (saved)
  const [audioProgress, setAudioProgress] = useState(0);
  const [loadingPreview, setLoadingPreview] = useState(null); // songId being loaded

  // Cache previewUrls для сохранённых песен { songId: url }
  const [previewCache, setPreviewCache] = useState({});

  const [addTarget, setAddTarget]     = useState(null);
  const [rank, setRank]               = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchTop100 = useCallback(async () => {
    setTop100(await getSongs("top100"));
  }, []);

  const fetchYearly = useCallback(async () => {
    setYearlySongs(await getSongs("yearly", selectedYear));
  }, [selectedYear]);

  useEffect(() => { fetchTop100(); }, [fetchTop100]);
  useEffect(() => { fetchYearly(); }, [fetchYearly]);

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); setShowResults(false); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      setSearchResults(await searchITunes(searchQuery));
      setShowResults(true);
      setSearching(false);
    }, 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Play iTunes preview (from search results)
  const toggleITunesPreview = (track) => {
    if (!track.previewUrl) return;
    if (playingId === `itunes-${track.trackId}`) {
      audioRef.current.pause();
      setPlayingId(null);
    } else {
      audioRef.current.src = track.previewUrl;
      audioRef.current.play();
      setPlayingId(`itunes-${track.trackId}`);
    }
  };

  // Play saved song preview (fetch from iTunes if not cached)
  const toggleSavedPreview = async (song) => {
    const key = `saved-${song.id}`;
    if (playingId === key) {
      audioRef.current.pause();
      setPlayingId(null);
      return;
    }
    let url = previewCache[song.id];
    if (!url) {
      setLoadingPreview(song.id);
      url = await getPreviewUrl(song.title, song.artist);
      setLoadingPreview(null);
      if (!url) return;
      setPreviewCache(prev => ({ ...prev, [song.id]: url }));
    }
    audioRef.current.src = url;
    audioRef.current.play();
    setPlayingId(key);
  };

  const handleAddFromITunes = async () => {
    if (!addTarget) return;
    const cover = addTarget.artworkUrl100?.replace("100x100bb", "300x300bb");
    await createSong({
      title:     addTarget.trackName,
      artist:    addTarget.artistName,
      cover_url: cover || null,
      link:      addTarget.trackViewUrl || null,
      rank:      rank ? Number(rank) : null,
      year:      activeTab === "yearly" ? selectedYear : null,
      list_type: activeTab,
    });
    setAddTarget(null); setRank(""); setShowAddForm(false);
    setSearchQuery(""); setShowResults(false);
    if (audioRef.current) { audioRef.current.pause(); setPlayingId(null); }
    if (activeTab === "top100") fetchTop100(); else fetchYearly();
  };

  const handleDelete = async (id) => {
    if (playingId === `saved-${id}`) {
      audioRef.current.pause(); setPlayingId(null);
    }
    await deleteSong(id);
    if (activeTab === "top100") fetchTop100(); else fetchYearly();
  };

  const songs = (activeTab === "top100" ? top100 : yearlySongs)
    .sort((a, b) => (a.rank || 999) - (b.rank || 999));

  return (
    <>
      <style>{STYLES}</style>
      <audio
        ref={audioRef}
        onEnded={() => { setPlayingId(null); setAudioProgress(0); }}
        onTimeUpdate={() => {
          if (audioRef.current)
            setAudioProgress((audioRef.current.currentTime / audioRef.current.duration) * 100 || 0);
        }}
      />

      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "24px 16px 60px" }}>

        {/* Header */}
        <div style={{ marginBottom: "28px", animation: "fadeUp 0.4s ease both" }}>
          <h1 style={{ color: "var(--text-color)", fontWeight: "900",
            fontSize: "clamp(24px,4vw,36px)", margin: "0 0 6px", letterSpacing: "-0.5px" }}>
            🎵 My Music
          </h1>
          <p style={{ color: "var(--text-color)", opacity: 0.45, fontSize: "14px", margin: 0 }}>
            Your personal soundtrack — powered by iTunes
          </p>
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px",
            background: "var(--block-bg)", backdropFilter: "blur(14px)",
            borderRadius: "16px", border: "1px solid var(--block-border)",
            padding: "12px 16px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
            <span style={{ fontSize: "18px", flexShrink: 0 }}>🔍</span>
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search song or artist..."
              style={{ flex: 1, background: "transparent", border: "none", outline: "none",
                color: "var(--text-color)", fontSize: "14px", fontWeight: "500" }} />
            {searching && (
              <div style={{ width: "18px", height: "18px", borderRadius: "50%", flexShrink: 0,
                border: "2px solid var(--block-border)", borderTopColor: "#7c3aed",
                animation: "spin 0.8s linear infinite" }} />
            )}
            {searchQuery && !searching && (
              <button onClick={() => { setSearchQuery(""); setShowResults(false); }}
                style={{ background: "none", border: "none", cursor: "pointer",
                  color: "var(--text-color)", opacity: 0.4, fontSize: "18px" }}>✕</button>
            )}
          </div>

          {showResults && searchResults.length > 0 && (
            <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, zIndex: 200,
              background: "var(--block-bg)", backdropFilter: "blur(20px)",
              borderRadius: "16px", border: "1px solid var(--block-border)",
              boxShadow: "0 16px 48px rgba(0,0,0,0.25)", overflow: "hidden" }}>
              {searchResults.map(track => (
                <div key={track.trackId} style={{ display: "flex", alignItems: "center", gap: "12px",
                  padding: "12px 16px", borderBottom: "1px solid var(--block-border)", transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(124,58,237,0.07)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <img src={track.artworkUrl100} alt={track.trackName}
                    style={{ width: "44px", height: "44px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: "var(--text-color)", fontWeight: "700", fontSize: "13px",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{track.trackName}</div>
                    <div style={{ color: "var(--text-color)", opacity: 0.5, fontSize: "12px" }}>{track.artistName}</div>
                  </div>
                  {track.previewUrl && (
                    <button onClick={() => toggleITunesPreview(track)} style={{
                      width: "34px", height: "34px", borderRadius: "50%", border: "none",
                      cursor: "pointer", flexShrink: 0, fontSize: "13px",
                      background: playingId === `itunes-${track.trackId}` ? "#7c3aed" : "rgba(124,58,237,0.12)",
                      color: playingId === `itunes-${track.trackId}` ? "white" : "#7c3aed",
                      display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s",
                    }}>{playingId === `itunes-${track.trackId}` ? "⏸" : "▶"}</button>
                  )}
                  <button onClick={() => {
                    setAddTarget(track); setShowAddForm(true);
                    setShowResults(false); setSearchQuery("");
                    if (audioRef.current) { audioRef.current.pause(); setPlayingId(null); }
                  }} style={{ padding: "6px 14px", borderRadius: "8px", border: "none", cursor: "pointer",
                    background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
                    color: "white", fontSize: "12px", fontWeight: "700", flexShrink: 0 }}>+ Add</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preview progress */}
        {playingId && (
          <div style={{ marginBottom: "16px" }}>
            <div style={{ background: "var(--block-border)", borderRadius: "4px", height: "3px" }}>
              <div style={{ width: `${audioProgress}%`, height: "100%", borderRadius: "4px",
                background: "linear-gradient(90deg,#7c3aed,#10b981)", transition: "width 0.5s linear" }} />
            </div>
            <p style={{ color: "var(--text-color)", opacity: 0.4, fontSize: "11px",
              margin: "4px 0 0", textAlign: "center" }}>▶ 30s preview</p>
          </div>
        )}

        {/* Add form */}
        {showAddForm && addTarget && (
          <div style={{ background: "var(--block-bg)", backdropFilter: "blur(14px)",
            borderRadius: "16px", border: "1px solid rgba(124,58,237,0.35)",
            padding: "20px", marginBottom: "20px", animation: "fadeUp 0.3s ease" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
              <img src={addTarget.artworkUrl100?.replace("100x100bb","300x300bb")} alt={addTarget.trackName}
                style={{ width: "54px", height: "54px", borderRadius: "10px", objectFit: "cover" }} />
              <div>
                <div style={{ color: "var(--text-color)", fontWeight: "800", fontSize: "15px" }}>{addTarget.trackName}</div>
                <div style={{ color: "var(--text-color)", opacity: 0.5, fontSize: "13px" }}>{addTarget.artistName}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
              {["top100", "yearly"].map(t => (
                <button key={t} onClick={() => setActiveTab(t)} style={{
                  padding: "7px 16px", borderRadius: "8px", border: "none", cursor: "pointer",
                  fontWeight: "700", fontSize: "13px",
                  background: activeTab === t ? "linear-gradient(135deg,#7c3aed,#5b21b6)" : "rgba(255,255,255,0.06)",
                  color: activeTab === t ? "white" : "var(--text-color)",
                }}>{t === "top100" ? "🏆 Top 100" : "📅 Yearly"}</button>
              ))}
              {activeTab === "yearly" && (
                <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--block-border)",
                    borderRadius: "8px", padding: "7px 12px", color: "var(--text-color)", cursor: "pointer" }}>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              )}
              <input type="number" placeholder="Rank #" value={rank} onChange={e => setRank(e.target.value)}
                style={{ width: "80px", background: "rgba(255,255,255,0.06)",
                  border: "1px solid var(--block-border)", borderRadius: "8px",
                  padding: "7px 12px", color: "var(--text-color)", outline: "none" }} />
              <button onClick={handleAddFromITunes} style={{ padding: "8px 20px", borderRadius: "10px",
                border: "none", cursor: "pointer", background: "linear-gradient(135deg,#10b981,#059669)",
                color: "white", fontWeight: "700", fontSize: "13px" }}>✅ Save</button>
              <button onClick={() => { setShowAddForm(false); setAddTarget(null); }} style={{
                padding: "8px 14px", borderRadius: "10px", cursor: "pointer",
                border: "1px solid var(--block-border)", background: "transparent",
                color: "var(--text-color)", fontWeight: "600", fontSize: "13px", opacity: 0.55 }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
          {[
            { key: "top100", label: "🏆 Top 100", count: top100.length },
            { key: "yearly", label: `📅 ${selectedYear}`, count: yearlySongs.length },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              padding: "10px 20px", borderRadius: "30px", cursor: "pointer", fontWeight: "700", fontSize: "13px",
              border: activeTab === tab.key ? "none" : "1px solid var(--block-border)",
              background: activeTab === tab.key ? "linear-gradient(135deg,#7c3aed,#5b21b6)" : "var(--block-bg)",
              color: activeTab === tab.key ? "white" : "var(--text-color)",
              opacity: activeTab === tab.key ? 1 : 0.6, transition: "all 0.2s",
            }}>
              {tab.label}
              <span style={{ marginLeft: "7px", padding: "1px 7px", borderRadius: "10px", fontSize: "11px",
                background: activeTab === tab.key ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.07)" }}>
                {tab.count}
              </span>
            </button>
          ))}
          {activeTab === "yearly" && (
            <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
              {YEARS.map(y => (
                <button key={y} onClick={() => setSelectedYear(y)} style={{
                  padding: "5px 11px", borderRadius: "20px", border: "none", cursor: "pointer",
                  fontSize: "12px", fontWeight: selectedYear === y ? "700" : "500",
                  background: selectedYear === y ? "#7c3aed" : "rgba(255,255,255,0.06)",
                  color: selectedYear === y ? "white" : "var(--text-color)", transition: "all 0.15s",
                }}>{y}</button>
              ))}
            </div>
          )}
        </div>

        {/* Song list */}
        {songs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px",
            background: "var(--block-bg)", borderRadius: "20px", border: "1px dashed var(--block-border)" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px", animation: "pulse 2s ease infinite" }}>🎵</div>
            <p style={{ color: "var(--text-color)", opacity: 0.4, margin: 0, fontSize: "14px" }}>
              {activeTab === "top100" ? "Search and add your all-time favorites!" : `No songs for ${selectedYear} yet`}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {songs.map((song, idx) => (
              <div key={song.id} className="music-card" style={{
                display: "flex", alignItems: "center", gap: "14px",
                background: "var(--block-bg)", backdropFilter: "blur(14px)",
                borderRadius: "14px", border: "1px solid var(--block-border)",
                padding: "11px 16px", animationDelay: `${idx * 0.025}s`,
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateX(4px)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(124,58,237,0.12)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
              >
                {/* Rank */}
                <div style={{ width: "26px", flexShrink: 0, textAlign: "center" }}>
                  <span style={{ fontWeight: "900",
                    fontSize: idx < 3 ? "15px" : "12px",
                    color: idx === 0 ? "#f59e0b" : idx === 1 ? "#94a3b8" : idx === 2 ? "#cd7c3f" : "var(--text-color)",
                    opacity: idx < 3 ? 1 : 0.35,
                  }}>{song.rank || idx + 1}</span>
                </div>

                {/* Cover */}
                {song.cover_url
                  ? <img src={song.cover_url} alt={song.title}
                      style={{ width: "44px", height: "44px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }} />
                  : <div style={{ width: "44px", height: "44px", borderRadius: "8px", flexShrink: 0,
                      background: "linear-gradient(135deg,#7c3aed22,#10b98122)",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>🎵</div>
                }

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "var(--text-color)", fontWeight: "700", fontSize: "14px",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{song.title}</div>
                  <div style={{ color: "var(--text-color)", opacity: 0.5, fontSize: "12px" }}>{song.artist}</div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "8px", flexShrink: 0, alignItems: "center" }}>

                  {/* 30s Preview */}
                  <button onClick={() => toggleSavedPreview(song)} style={{
                    width: "32px", height: "32px", borderRadius: "50%", border: "none",
                    cursor: "pointer", flexShrink: 0, fontSize: "13px",
                    background: playingId === `saved-${song.id}` ? "#7c3aed" : "rgba(124,58,237,0.12)",
                    color: playingId === `saved-${song.id}` ? "white" : "#7c3aed",
                    display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s",
                  }}>
                    {loadingPreview === song.id
                      ? <div style={{ width: "12px", height: "12px", borderRadius: "50%",
                          border: "2px solid #7c3aed44", borderTopColor: "#7c3aed",
                          animation: "spin 0.8s linear infinite" }} />
                      : playingId === `saved-${song.id}` ? "⏸" : "▶"
                    }
                  </button>

                  {/* Apple Music link */}
                  {song.link && (
                    <a href={song.link} target="_blank" rel="noreferrer"
                      style={{ width: "32px", height: "32px", borderRadius: "50%", textDecoration: "none",
                        background: "rgba(29,185,84,0.12)", border: "1px solid rgba(29,185,84,0.3)",
                        color: "#1db954", display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "13px", transition: "all 0.2s", flexShrink: 0 }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#1db954"; e.currentTarget.style.color = "white"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(29,185,84,0.12)"; e.currentTarget.style.color = "#1db954"; }}
                    >♫</a>
                  )}
                  {/* Pin as Song of the Day */}
                  <button onClick={async () => {
                    const data = { title: song.title, artist: song.artist, cover_url: song.cover_url || null };
                    localStorage.setItem("songOfDay", JSON.stringify({ ...data, date: new Date().toDateString() }));
                    await setSongOfDay(data);
                    alert("📌 Song of the Day set!");
                  }} style={{
                    width: "32px", height: "32px", borderRadius: "50%", border: "none",
                    cursor: "pointer", flexShrink: 0, fontSize: "14px",
                    background: "rgba(245,158,11,0.1)", color: "#f59e0b",
                    display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#f59e0b"; e.currentTarget.style.color = "white"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(245,158,11,0.1)"; e.currentTarget.style.color = "#f59e0b"; }}
                  >📌</button>

                  {/* Delete */}
                  <button onClick={() => handleDelete(song.id)} style={{
                    width: "32px", height: "32px", borderRadius: "50%", border: "none",
                    cursor: "pointer", flexShrink: 0, fontSize: "14px",
                    background: "rgba(239,68,68,0.1)", color: "#ef4444",
                    display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#ef4444"; e.currentTarget.style.color = "white"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.color = "#ef4444"; }}
                  >✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default MusicPage;