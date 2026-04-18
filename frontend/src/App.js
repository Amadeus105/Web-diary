import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import ParticlesBackground from "./components/Particles";
import CardNavbar from "./components/CardNavbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Completed from "./pages/Completed";
import About from "./pages/About";
import SuggestionsPage from "./pages/SuggestionsPage";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import CatalogPage from "./pages/CatalogPage";
import MusicPage from "./pages/MusicPage";

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  return user?.is_admin ? children : <Navigate to="/" />;
};

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <Router>
      {theme === "dark" && <ParticlesBackground />}

      {/* Vignette sides */}
      <div style={{
        position: "fixed",
        top: 0, left: 0,
        width: "100vw", height: "100vh",
        background: "radial-gradient(ellipse at center, transparent 60%, var(--vignette-color) 100%)",
        pointerEvents: "none",
        zIndex: 0
      }} />


      <CardNavbar theme={theme} toggleTheme={toggleTheme} />

      <div style={{
        paddingTop: "80px",
        minHeight: "100vh",
        backgroundColor: theme === "dark" ? "transparent" : "var(--bg-color)",
        color: "var(--text-color)",
        transition: "background-color 0.3s, color 0.3s",
        position: "relative",
        zIndex: 1,
        display: "flex",
        flexDirection: "column",
      }}>
        <div className="container py-4" style={{ flex: 1 }}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/completed" element={<ProtectedRoute><Completed /></ProtectedRoute>} />
            <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
            <Route path="/suggestions" element={<ProtectedRoute><SuggestionsPage /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
            <Route path="/catalog" element={<ProtectedRoute><CatalogPage /></ProtectedRoute>} />
            <Route path="/music" element={<ProtectedRoute><MusicPage /></ProtectedRoute>} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;