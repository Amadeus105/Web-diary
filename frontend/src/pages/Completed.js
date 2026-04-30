import React from "react";
import ItemList from "../components/ItemList";
import { exportItems } from "../services/api";

const Completed = () => {
  return (
    <div style={{ paddingTop: "24px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 16px" }}>
        <div style={{ marginBottom: "8px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1
              style={{
                margin: 0,
                color: "var(--text-color)",
                fontWeight: "900",
                fontSize: "clamp(26px, 4vw, 36px)",
                letterSpacing: "-0.5px",
              }}
            >
              📚 My Library
            </h1>
            <p
              style={{
                margin: "6px 0 0",
                color: "var(--text-color)",
                opacity: 0.45,
                fontSize: "14px",
              }}
            >
              Track every game you've beaten and book you've read
            </p>
          </div>

          <button
            onClick={exportItems}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              padding: "10px 18px",
              borderRadius: "12px",
              border: "1px solid var(--block-border)",
              background: "var(--block-bg)",
              color: "var(--text-color)",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
              backdropFilter: "blur(14px)",
              transition: "background 0.2s, transform 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(124,58,237,0.12)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--block-bg)"; e.currentTarget.style.transform = "none"; }}
          >
            ⬇️ Export CSV
          </button>
        </div>
      </div>

      <ItemList />
    </div>
  );
};

export default Completed;
