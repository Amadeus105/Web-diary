import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import CardNavbar from "./components/CardNavbar";
import Home from "./pages/Home";
import Completed from "./pages/Completed";
import About from "./pages/About";

function App() {
  return (
    <Router>
      <CardNavbar />

      <div
        style={{
          paddingTop: "80px",
          minHeight: "100vh",
          backgroundColor: "var(--bg-color)",
          color: "var(--text-color)",
          transition: "background-color 0.3s, color 0.3s",
        }}
      >
        <div className="container py-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/completed" element={<Completed />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;