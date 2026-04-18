import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { login, register, getMe } from "../services/api";

const LoginPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (isRegister) {
      const data = await register(username, password);
      if (data.detail) {
        setError(data.detail);
        setLoading(false);
        return;
      }
    }

    const data = await login(username, password);
    if (data.detail) {
      setError(data.detail);
      setLoading(false);
      return;
    }

    const userInfo = await getMe(data.access_token);
    authLogin(data.access_token, userInfo);
    navigate("/");
  };

  return (
    <div style={{
      minHeight: "90vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
    }}>
      {/* Decorative blobs */}
      <div style={{
        position: "fixed",
        top: "15%",
        left: "20%",
        width: "300px",
        height: "300px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)",
        filter: "blur(40px)",
        pointerEvents: "none",
        zIndex: 0,
      }} />
      <div style={{
        position: "fixed",
        bottom: "20%",
        right: "15%",
        width: "250px",
        height: "250px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)",
        filter: "blur(40px)",
        pointerEvents: "none",
        zIndex: 0,
      }} />

      {/* Card */}
      <div style={{
        position: "relative",
        zIndex: 1,
        width: "100%",
        maxWidth: "420px",
        background: "var(--block-bg)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRadius: "24px",
        border: "1px solid var(--block-border)",
        padding: "40px",
        boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
      }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "40px", marginBottom: "8px" }}>🌐</div>
          <h2 style={{
            color: "var(--text-color)",
            fontWeight: "800",
            fontSize: "24px",
            margin: 0,
            letterSpacing: "-0.5px"
          }}>
            Web Diary
          </h2>
          <p style={{
            color: "var(--text-color)",
            opacity: 0.5,
            fontSize: "14px",
            margin: "6px 0 0 0"
          }}>
            {isRegister ? "Create your account" : "Welcome back"}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: "10px",
            padding: "12px 16px",
            marginBottom: "20px",
            color: "#ef4444",
            fontSize: "14px",
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{
              display: "block",
              color: "var(--text-color)",
              opacity: 0.7,
              fontSize: "13px",
              fontWeight: "600",
              marginBottom: "6px",
              letterSpacing: "0.3px"
            }}>
              USERNAME
            </label>
            <input
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "12px",
                border: "1px solid var(--block-border)",
                background: "var(--block-bg)",
                color: "var(--text-color)",
                fontSize: "15px",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "#7c3aed"}
              onBlur={e => e.target.style.borderColor = "var(--block-border)"}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{
              display: "block",
              color: "var(--text-color)",
              opacity: 0.7,
              fontSize: "13px",
              fontWeight: "600",
              marginBottom: "6px",
              letterSpacing: "0.3px"
            }}>
              PASSWORD
            </label>
            <input
              placeholder="Enter your password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "12px",
                border: "1px solid var(--block-border)",
                background: "var(--block-bg)",
                color: "var(--text-color)",
                fontSize: "15px",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "#7c3aed"}
              onBlur={e => e.target.style.borderColor = "var(--block-border)"}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "12px",
              border: "none",
              background: loading
                ? "rgba(124,58,237,0.5)"
                : "linear-gradient(135deg, #7c3aed, #5b21b6)",
              color: "white",
              fontSize: "15px",
              fontWeight: "700",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "opacity 0.2s, transform 0.1s",
              letterSpacing: "0.3px",
            }}
            onMouseEnter={e => { if (!loading) e.target.style.opacity = "0.9"; }}
            onMouseLeave={e => { e.target.style.opacity = "1"; }}
            onMouseDown={e => { if (!loading) e.target.style.transform = "scale(0.98)"; }}
            onMouseUp={e => { e.target.style.transform = "scale(1)"; }}
          >
            {loading ? "⏳ Please wait..." : isRegister ? "Create Account" : "Sign In"}
          </button>
        </form>

        {/* Switch */}
        <p style={{
          textAlign: "center",
          marginTop: "24px",
          color: "var(--text-color)",
          opacity: 0.6,
          fontSize: "14px",
          margin: "24px 0 0 0"
        }}>
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <span
            onClick={() => { setIsRegister(!isRegister); setError(""); }}
            style={{
              color: "#7c3aed",
              cursor: "pointer",
              fontWeight: "600",
              opacity: 1,
            }}
          >
            {isRegister ? "Sign In" : "Register"}
          </span>
        </p>

      </div>
    </div>
  );
};

export default LoginPage;