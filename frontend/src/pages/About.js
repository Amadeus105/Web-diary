import React, { useState, useEffect } from "react";
import ProfileCard from "../components/ProfileCard";
import { getProfile, saveProfile, setHiddenCategories } from "../services/api";

const ALL_CATEGORIES = [
  { key: "game",    label: "🎮 Games" },
  { key: "book",    label: "📚 Books" },
  { key: "movie",   label: "🎬 Movies" },
  { key: "cartoon", label: "🎨 Cartoons" },
  { key: "anime",   label: "🌸 Anime" },
];

const About = () => {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [handle, setHandle] = useState("");
  const [status, setStatus] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [saved, setSaved] = useState(false);

  // Privacy: which categories are hidden from public profile
  const [hiddenCats, setHiddenCats] = useState([]);
  const [privacySaved, setPrivacySaved] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setName(data.name || "");
        setTitle(data.title || "");
        setHandle(data.handle || "");
        setStatus(data.status || "");
        setAvatarUrl(data.avatar_url || "");
        setGithubUrl(data.github_url || "");
        // Parse hidden categories stored as JSON string
        if (data.hidden_categories) {
          try {
            setHiddenCats(JSON.parse(data.hidden_categories));
          } catch { setHiddenCats([]); }
        }
      } catch (e) {
        console.log("No profile yet");
      }
    };
    fetchProfile();
  }, []);

  const toggleCategory = (key) => {
    setHiddenCats(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleSavePrivacy = async () => {
    await setHiddenCategories(hiddenCats);
    setPrivacySaved(true);
    setTimeout(() => setPrivacySaved(false), 3000);
  };

  const handleSave = async () => {
    await saveProfile({ name, title, handle, status, avatar_url: avatarUrl, github_url: githubUrl });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <h2 style={{ color: "var(--text-color)", marginBottom: "30px" }}>About</h2>

      <div style={{ display: "flex", gap: "40px", flexWrap: "wrap", alignItems: "flex-start" }}>

        <div style={{ flexShrink: 0 }}>
          <ProfileCard
            avatarUrl={avatarUrl || "https://i.pravatar.cc/300?img=8"}
            miniAvatarUrl={avatarUrl || "https://i.pravatar.cc/100?img=8"}
            name={name || "Your Name"}
            title={title || "Your Title"}
            handle={handle || "yourhandle"}
            status={status || "Online"}
            contactText="GitHub"
            onContactClick={() => window.open(githubUrl || "https://github.com/", "_blank")}
          />
        </div>

        <div style={{ flex: 1, minWidth: "280px" }}>
          <div style={{
            background: "var(--block-bg, rgba(0,0,0,0.05))",
            border: "1px solid var(--block-border, rgba(0,0,0,0.1))",
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "16px"
          }}>
            <h4 style={{ color: "var(--text-color)", marginBottom: "16px" }}>
              👤 Your Profile Description
            </h4>

            {saved && <div className="alert alert-success mb-3">✅ Profile saved!</div>}

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <input style={inputStyle} placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} />
              <input style={inputStyle} placeholder="Title (e.g. Developer)" value={title} onChange={(e) => setTitle(e.target.value)} />
              <input style={inputStyle} placeholder="Handle (without @)" value={handle} onChange={(e) => setHandle(e.target.value)} />
              <input style={inputStyle} placeholder="Status (e.g. Online)" value={status} onChange={(e) => setStatus(e.target.value)} />
              <input style={inputStyle} placeholder="Avatar URL (paste image link)" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />
              <input style={inputStyle} placeholder="GitHub URL" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} />

              <button
                onClick={handleSave}
                style={{
                  background: "#7c3aed",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  padding: "12px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  marginTop: "6px"
                }}
              >
                💾 Save Profile
              </button>
            </div>
          </div>

          {/* ── Privacy Settings ─────────────────────────────── */}
          <div style={{
            background: "var(--block-bg, rgba(0,0,0,0.05))",
            border: "1px solid var(--block-border, rgba(0,0,0,0.1))",
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "16px"
          }}>
            <h4 style={{ color: "var(--text-color)", marginBottom: "6px" }}>🔒 Profile Privacy</h4>
            <p style={{ color: "var(--text-muted, #888)", fontSize: "13px", marginBottom: "16px" }}>
              Choose which categories are <strong>hidden</strong> from your public profile.
              Visitors won't see these sections at all.
            </p>

            {privacySaved && (
              <div className="alert alert-success mb-3">✅ Privacy settings saved!</div>
            )}

            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "16px" }}>
              {ALL_CATEGORIES.map(cat => {
                const isHidden = hiddenCats.includes(cat.key);
                return (
                  <button
                    key={cat.key}
                    onClick={() => toggleCategory(cat.key)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "20px",
                      border: isHidden
                        ? "2px solid #ef4444"
                        : "2px solid var(--block-border, rgba(0,0,0,0.15))",
                      background: isHidden
                        ? "rgba(239,68,68,0.12)"
                        : "var(--block-bg, rgba(0,0,0,0.05))",
                      color: isHidden ? "#ef4444" : "var(--text-color)",
                      cursor: "pointer",
                      fontWeight: isHidden ? "bold" : "normal",
                      fontSize: "14px",
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    {isHidden ? "🙈" : "👁"} {cat.label}
                  </button>
                );
              })}
            </div>

            <p style={{ color: "var(--text-muted, #888)", fontSize: "12px", marginBottom: "14px" }}>
              {hiddenCats.length === 0
                ? "Everything is visible on your profile."
                : `Hidden: ${hiddenCats.map(k => ALL_CATEGORIES.find(c => c.key === k)?.label).join(", ")}`}
            </p>

            <button
              onClick={handleSavePrivacy}
              style={{
                background: "#7c3aed",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "10px 20px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "14px"
              }}
            >
              💾 Save Privacy Settings
            </button>
          </div>

          <div style={{
            background: "var(--block-bg, rgba(0,0,0,0.05))",
            border: "1px solid var(--block-border, rgba(0,0,0,0.1))",
            borderRadius: "16px",
            padding: "24px"
          }}>
            <h4 style={{ color: "var(--text-color)", marginBottom: "12px" }}>🛠 Tech Stack</h4>
            <ul style={{ color: "var(--text-color)", lineHeight: "2" }}>
              <li>⚛️ Frontend: React</li>
              <li>⚡ Backend: FastAPI</li>
              <li>🐘 Database: PostgreSQL</li>
              <li>🐳 Deployment: Docker</li>
              <li>🔐 Auth: JWT</li>
              <li>🤖 AI: OpenRouter</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const inputStyle = {
  background: "var(--block-bg, rgba(0,0,0,0.05))",
  border: "1px solid var(--block-border, rgba(0,0,0,0.1))",
  borderRadius: "8px",
  padding: "10px 14px",
  color: "var(--text-color)",
  width: "100%",
  fontSize: "14px",
};

export default About;