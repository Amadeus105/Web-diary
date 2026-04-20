import { useState } from "react";
import { getPlot } from "../services/api";
import axios from "axios";

const BASE_URL = "http://localhost:8000";
const getToken = () => localStorage.getItem("token");

/* ─── constants ─────────────────────────────────────────── */
const LANGUAGES = [
  { value: "english", label: "🇬🇧 English" },
  { value: "russian", label: "🇷🇺 Русский" },
  { value: "kazakh",  label: "🇰🇿 Қазақша" },
];
const MEDIA_TYPES = [
  { value: "book",  label: "📚 Book"  },
  { value: "game",  label: "🎮 Game"  },
  { value: "movie", label: "🎬 Movie" },
];

const STYLES = `
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes pulse {
  0%,100% { opacity: 0.5; }
  50%      { opacity: 1; }
}
`;

/* ─── small helpers ─────────────────────────────────────── */
const Spinner = () => (
  <div style={{ width: "18px", height: "18px", borderRadius: "50%",
    border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white",
    animation: "spin 0.7s linear infinite", flexShrink: 0 }} />
);

const Block = ({ children, style = {} }) => (
  <div style={{
    background: "var(--block-bg)", backdropFilter: "blur(6px)",
    borderRadius: "20px", border: "1px solid var(--block-border)",
    padding: "24px", boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
    ...style,
  }}>{children}</div>
);

const SectionTitle = ({ children, accent }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
    <div style={{ width: "3px", height: "20px", borderRadius: "3px",
      background: accent, flexShrink: 0 }} />
    <h3 style={{ color: "var(--text-color)", fontWeight: "800",
      fontSize: "15px", margin: 0 }}>{children}</h3>
  </div>
);

/* ─── Plot Lookup panel ─────────────────────────────────── */
const PlotLookup = () => {
  const [query, setQuery]       = useState("");
  const [mediaType, setMediaType] = useState("book");
  const [language, setLanguage] = useState("english");
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const data = await getPlot(query.trim(), mediaType, language);
      setResult(data);
    } catch {
      setError("Couldn't fetch the plot. Try again.");
    }
    setLoading(false);
  };

  const inputStyle = {
    width: "100%", padding: "11px 14px", borderRadius: "11px",
    border: "1px solid var(--block-border)", background: "rgba(255,255,255,0.04)",
    color: "var(--text-color)", fontSize: "14px", outline: "none",
    boxSizing: "border-box", transition: "border-color 0.2s",
  };
  const focus = e => (e.target.style.borderColor = "#10b981");
  const blur  = e => (e.target.style.borderColor = "var(--block-border)");

  const toggleBtn = (options, value, setValue, activeColor) => (
    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
      {options.map(opt => (
        <button key={opt.value} type="button" onClick={() => setValue(opt.value)} style={{
          padding: "7px 14px", borderRadius: "20px", cursor: "pointer", fontSize: "12px",
          fontWeight: "700", border: value === opt.value ? "none" : "1px solid var(--block-border)",
          background: value === opt.value ? activeColor : "rgba(255,255,255,0.04)",
          color: value === opt.value ? "white" : "var(--text-color)",
          transition: "all 0.15s", opacity: value === opt.value ? 1 : 0.55,
        }}>{opt.label}</button>
      ))}
    </div>
  );

  return (
    <Block style={{ animation: "fadeUp 0.4s ease 0.1s both" }}>
      <SectionTitle accent="#10b981">🔍 Spoiler-Free Plot Lookup</SectionTitle>
      <p style={{ color: "var(--text-color)", opacity: 0.45, fontSize: "13px",
        margin: "0 0 18px", lineHeight: 1.5 }}>
        Enter any book, game, or movie name — get a short spoiler-free summary in your language.
      </p>

      <form onSubmit={handleLookup}>
        {/* Search input */}
        <div style={{ marginBottom: "14px" }}>
          <input style={inputStyle} placeholder='e.g. "The Witcher 3", "Dune", "Interstellar"'
            value={query} onChange={e => setQuery(e.target.value)}
            onFocus={focus} onBlur={blur} />
        </div>

        {/* Media type */}
        <div style={{ marginBottom: "12px" }}>
          <p style={{ color: "var(--text-color)", opacity: 0.45, fontSize: "11px",
            fontWeight: "700", letterSpacing: "0.6px", margin: "0 0 8px",
            textTransform: "uppercase" }}>Type</p>
          {toggleBtn(MEDIA_TYPES, mediaType, setMediaType, "linear-gradient(135deg,#10b981,#059669)")}
        </div>

        {/* Language */}
        <div style={{ marginBottom: "18px" }}>
          <p style={{ color: "var(--text-color)", opacity: 0.45, fontSize: "11px",
            fontWeight: "700", letterSpacing: "0.6px", margin: "0 0 8px",
            textTransform: "uppercase" }}>Language</p>
          {toggleBtn(LANGUAGES, language, setLanguage, "linear-gradient(135deg,#7c3aed,#5b21b6)")}
        </div>

        <button type="submit" disabled={loading || !query.trim()} style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          width: "100%", padding: "12px", borderRadius: "11px", border: "none",
          background: loading || !query.trim()
            ? "rgba(16,185,129,0.35)"
            : "linear-gradient(135deg,#10b981,#059669)",
          color: "white", fontWeight: "700", fontSize: "14px",
          cursor: loading || !query.trim() ? "not-allowed" : "pointer",
          transition: "background 0.2s",
        }}>
          {loading ? <><Spinner /> Looking up...</> : "🔍 Get Plot Summary"}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div style={{
          marginTop: "16px", padding: "12px 16px", borderRadius: "10px",
          background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
          color: "#ef4444", fontSize: "13px",
        }}>⚠️ {error}</div>
      )}

      {/* Result */}
      {result && (
        <div style={{
          marginTop: "18px", padding: "18px 20px", borderRadius: "14px",
          background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)",
          animation: "fadeUp 0.3s ease",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
            <span style={{ fontSize: "18px" }}>
              {mediaType === "book" ? "📚" : mediaType === "game" ? "🎮" : "🎬"}
            </span>
            <h4 style={{ color: "var(--text-color)", fontWeight: "800",
              fontSize: "15px", margin: 0 }}>{result.title}</h4>
            <span style={{
              marginLeft: "auto", padding: "2px 10px", borderRadius: "20px",
              background: "rgba(16,185,129,0.15)", color: "#10b981",
              fontSize: "10px", fontWeight: "700", letterSpacing: "0.4px",
              flexShrink: 0,
            }}>NO SPOILERS</span>
          </div>
          <p style={{ color: "var(--text-color)", opacity: 0.8, fontSize: "14px",
            margin: 0, lineHeight: 1.7 }}>{result.summary}</p>
        </div>
      )}
    </Block>
  );
};

/* ─── AI Recommendations panel ──────────────────────────── */
const AIRecommendations = () => {
  const [filterType, setFilterType] = useState("both");
  const [loading, setLoading]       = useState(false);
  const [intro, setIntro]           = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError]           = useState("");

  const handleGetSuggestions = async () => {
    setLoading(true); setError(""); setSuggestions([]); setIntro("");
    try {
      const response = await axios.post(
        `${BASE_URL}/suggestions/ai?filter_type=${filterType}`,
        {},
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setIntro(response.data.intro);
      setSuggestions(response.data.suggestions);
    } catch {
      setError("Failed to get suggestions. Try again.");
    }
    setLoading(false);
  };

  const TYPE_ACCENT = { book: "#7c3aed", game: "#10b981" };

  return (
    <Block style={{ animation: "fadeUp 0.4s ease 0.2s both" }}>
      <SectionTitle accent="#7c3aed">✨ AI Recommendations</SectionTitle>
      <p style={{ color: "var(--text-color)", opacity: 0.45, fontSize: "13px",
        margin: "0 0 18px", lineHeight: 1.5 }}>
        Get personalized picks based on your completed library.
      </p>

      {/* Filter */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "16px", flexWrap: "wrap" }}>
        {[
          { value: "both", label: "📚🎮 Both"   },
          { value: "book", label: "📚 Books"  },
          { value: "game", label: "🎮 Games"  },
        ].map(({ value, label }) => (
          <button key={value} onClick={() => setFilterType(value)} style={{
            padding: "7px 16px", borderRadius: "20px", cursor: "pointer", fontSize: "12px",
            fontWeight: "700", border: filterType === value ? "none" : "1px solid var(--block-border)",
            background: filterType === value ? "linear-gradient(135deg,#7c3aed,#5b21b6)" : "rgba(255,255,255,0.04)",
            color: filterType === value ? "white" : "var(--text-color)",
            transition: "all 0.15s", opacity: filterType === value ? 1 : 0.55,
          }}>{label}</button>
        ))}
      </div>

      {/* Get button */}
      <button onClick={handleGetSuggestions} disabled={loading} style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
        width: "100%", padding: "12px", borderRadius: "11px", border: "none",
        background: loading ? "rgba(124,58,237,0.35)" : "linear-gradient(135deg,#7c3aed,#5b21b6)",
        color: "white", fontWeight: "700", fontSize: "14px",
        cursor: loading ? "not-allowed" : "pointer", marginBottom: "20px",
        transition: "background 0.2s",
      }}>
        {loading ? <><Spinner /> Getting recommendations...</> : "✨ Get Recommendations"}
      </button>

      {error && (
        <div style={{ padding: "12px 16px", borderRadius: "10px",
          background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
          color: "#ef4444", fontSize: "13px", marginBottom: "16px",
        }}>⚠️ {error}</div>
      )}

      {/* Intro */}
      {intro && (
        <div style={{
          padding: "14px 16px", borderRadius: "12px", marginBottom: "16px",
          background: "rgba(124,58,237,0.07)", border: "1px solid rgba(124,58,237,0.2)",
          color: "var(--text-color)", opacity: 0.75, fontStyle: "italic", fontSize: "13px",
          lineHeight: 1.6,
        }}>{intro}</div>
      )}

      {/* Suggestion cards */}
      {suggestions.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {suggestions.map((s, i) => {
            const accent = TYPE_ACCENT[s.type] ?? "#7c3aed";
            return (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: "14px",
                padding: "14px 16px", borderRadius: "13px",
                background: `${accent}09`,
                border: `1px solid ${accent}30`,
                animation: `fadeUp 0.3s ease ${i * 0.06}s both`,
              }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "10px", flexShrink: 0,
                  background: `${accent}20`, display: "flex",
                  alignItems: "center", justifyContent: "center", fontSize: "20px",
                }}>
                  {s.type === "book" ? "📚" : "🎮"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span style={{ color: "var(--text-color)", fontWeight: "800", fontSize: "14px" }}>
                      {s.title}
                    </span>
                    <span style={{
                      padding: "2px 8px", borderRadius: "20px", fontSize: "10px", fontWeight: "700",
                      background: `${accent}20`, color: accent, flexShrink: 0,
                    }}>{s.type}</span>
                  </div>
                  <p style={{ color: "var(--text-color)", opacity: 0.6,
                    fontSize: "12px", margin: 0, lineHeight: 1.5 }}>
                    {s.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!loading && suggestions.length === 0 && !error && !intro && (
        <div style={{ textAlign: "center", padding: "30px 20px",
          color: "var(--text-color)", opacity: 0.3 }}>
          <div style={{ fontSize: "40px", marginBottom: "8px",
            animation: "pulse 2.5s ease infinite" }}>🤖</div>
          <p style={{ fontSize: "13px", margin: 0 }}>
            Hit the button to get your personalised picks
          </p>
        </div>
      )}
    </Block>
  );
};

/* ─── Page ──────────────────────────────────────────────── */
const SuggestionsPage = () => (
  <>
    <style>{STYLES}</style>
    <div style={{ maxWidth: "980px", margin: "0 auto", padding: "24px 16px 60px" }}>

      {/* Header */}
      <div style={{ marginBottom: "28px", animation: "fadeUp 0.4s ease both" }}>
        <h1 style={{ color: "var(--text-color)", fontWeight: "900",
          fontSize: "clamp(24px,4vw,34px)", letterSpacing: "-0.5px", margin: "0 0 6px" }}>
          🤖 AI Assistant
        </h1>
        <p style={{ color: "var(--text-color)", opacity: 0.45, fontSize: "14px", margin: 0 }}>
          Spoiler-free plot lookup · Personalised recommendations · 3 languages
        </p>
      </div>

      {/* Two-column layout on wide screens */}
      <div style={{ display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "20px" }}>
        <PlotLookup />
        <AIRecommendations />
      </div>
    </div>
  </>
);

export default SuggestionsPage;