import React from "react";
import ItemList from "../components/ItemList";

const Completed = () => {
  return (
    <div style={{ paddingTop: "24px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 16px" }}>
        <div style={{ marginBottom: "8px" }}>
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
      </div>

      <ItemList />
    </div>
  );
};

export default Completed;