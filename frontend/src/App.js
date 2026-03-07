import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import CardNavbar from "./components/CardNavbar";
import Home from "./pages/Home";
import Completed from "./pages/Completed";
import About from "./pages/About";
import SuggestionsPage from "./pages/SuggestionsPage";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  return user?.is_admin ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <CardNavbar />
      <div style={{
        paddingTop: "80px",
        minHeight: "100vh",
        backgroundColor: "var(--bg-color)",
        color: "var(--text-color)",
        transition: "background-color 0.3s, color 0.3s",
      }}>
        <div className="container py-4">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/completed" element={<ProtectedRoute><Completed /></ProtectedRoute>} />
            <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
            <Route path="/suggestions" element={<ProtectedRoute><SuggestionsPage /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;