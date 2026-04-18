import React, { useState, useEffect } from "react";
import ProfileCard from "../components/ProfileCard";
import { getProfile, saveProfile } from "../services/api";

const About = () => {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [handle, setHandle] = useState("");
  const [status, setStatus] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [saved, setSaved] = useState(false);

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
      } catch (e) {
        console.log("No profile yet");
      }
    };
    fetchProfile();
  }, []);

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