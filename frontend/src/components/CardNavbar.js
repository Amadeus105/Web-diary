import { useLayoutEffect, useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import { Link, useNavigate } from "react-router-dom";
import { GoArrowUpRight } from "react-icons/go";
import { useAuth } from "../context/AuthContext";
import { getProfile } from "../services/api";
import "./CardNavbar.css";

const CardNavbar = ({ theme, toggleTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [userDropOpen, setUserDropOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const sidebarRef = useRef(null);
  const overlayRef = useRef(null);
  const tlRef = useRef(null);
  const dropRef = useRef(null);

  // Fetch avatar when user changes
  useEffect(() => {
    if (user) {
      getProfile()
        .then((p) => setAvatarUrl(p?.avatar_url || null))
        .catch(() => setAvatarUrl(null));
    } else {
      setAvatarUrl(null);
    }
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setUserDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useLayoutEffect(() => {
    const sidebar = sidebarRef.current;
    const overlay = overlayRef.current;

    gsap.set(sidebar, { x: "-100%" });
    gsap.set(overlay, { opacity: 0, pointerEvents: "none" });

    const tl = gsap.timeline({ paused: true });
    tl.to(sidebar, { x: "0%", duration: 0.4, ease: "power3.out" });
    tl.to(overlay, { opacity: 1, pointerEvents: "auto", duration: 0.3 }, 0);

    tlRef.current = tl;
    return () => tl.kill();
  }, []);

  const toggleMenu = () => {
    const tl = tlRef.current;
    if (!tl) return;
    if (!isOpen) {
      tl.play();
      setIsOpen(true);
    } else {
      tl.reverse();
      setIsOpen(false);
      setUserMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUserDropOpen(false);
    navigate("/login");
  };

  const handleNavClick = () => {
    toggleMenu();
    setUserMenuOpen(false);
  };

  const mainLinks = [
    { label: "Home", to: "/" },
    { label: "Completed", to: "/completed" },
    { label: "AI offer", to: "/suggestions" },
    { label: "Catalog", to: "/catalog" },
    { label: "Music", to: "/music" },
    ...(user?.is_admin ? [{ label: "Admin", to: "/admin" }] : []),
  ];

  const userLinks = [
    { label: "Profile", to: user ? `/u/${user.username}` : "/login", emoji: "👤" },
    { label: "Friends", to: "/friends", emoji: "🤝" },
    { label: "Chat", to: "/chat", emoji: "💬" },
    { label: "About", to: "/about", emoji: "ℹ️" },
  ];

  const initials = user?.username?.slice(0, 2).toUpperCase() || "?";

  return (
    <>
      {/* Hamburger */}
      <div className="hamburger-button" onClick={toggleMenu}>
        <div className={`line ${isOpen ? "rotate1" : ""}`} />
        <div className={`line ${isOpen ? "rotate2" : ""}`} />
      </div>

      {/* Site title */}
      <div
        style={{
          position: "fixed",
          top: "18px",
          left: "70px",
          zIndex: 1100,
          fontWeight: "800",
          fontSize: "20px",
          color: "var(--text-color)",
          letterSpacing: "0.5px",
          pointerEvents: "none",
          opacity: isOpen || scrolled ? 0 : 1,
          transition: "opacity 0.3s ease",
        }}
      >
        🌐 Web Diary
      </div>

      {/* ── Right-side user widget ── */}
      <div className="navbar-user-widget" ref={dropRef}>
        <button
          className="navbar-avatar-btn"
          onClick={() => setUserDropOpen((v) => !v)}
          title={user ? user.username : "Sign in"}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="avatar" className="navbar-avatar-img" />
          ) : (
            <div className="navbar-avatar-placeholder">
              {user ? initials : "?"}
            </div>
          )}
          {user && <span className="navbar-username">{user.username}</span>}
          {!user && <span className="navbar-username">Sign in</span>}
        </button>

        {/* Dropdown */}
        <div className={`navbar-user-drop ${userDropOpen ? "open" : ""}`}>
          {user ? (
            <>
              <div className="drop-header">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" className="drop-avatar-img" />
                ) : (
                  <div className="drop-avatar-placeholder">{initials}</div>
                )}
                <div>
                  <div className="drop-username">{user.username}</div>
                  {user.is_admin && <div className="drop-badge">Admin</div>}
                </div>
              </div>
              <div className="drop-divider" />
              <Link to={`/u/${user.username}`} className="drop-item" onClick={() => setUserDropOpen(false)}>
                👤 Profile
              </Link>
              <Link to="/friends" className="drop-item" onClick={() => setUserDropOpen(false)}>
                🤝 Friends
              </Link>
              <Link to="/chat" className="drop-item" onClick={() => setUserDropOpen(false)}>
                💬 Chat
              </Link>
              <div className="drop-divider" />
              <button className="drop-item drop-logout" onClick={handleLogout}>
                🚪 Sign out
              </button>
            </>
          ) : (
            <>
              <div className="drop-header" style={{ justifyContent: "center" }}>
                <div className="drop-avatar-placeholder">?</div>
              </div>
              <div className="drop-divider" />
              <Link to="/login" className="drop-item" onClick={() => setUserDropOpen(false)}>
                🔑 Sign in
              </Link>
            </>
          )}
        </div>
      </div>

      <div ref={overlayRef} className="overlay" onClick={toggleMenu} />

      {/* Sidebar */}
      <div ref={sidebarRef} className="sidebar">
        <h2 className="logo">🌐 Web-Diary</h2>

        <div className="nav-links">
          {mainLinks.map((item) => (
            <Link key={item.label} to={item.to} onClick={handleNavClick} className="nav-link">
              {item.label}
              <GoArrowUpRight />
            </Link>
          ))}

          {/* User submenu */}
          <div className="nav-submenu-wrapper">
            <button
              className="nav-link nav-link-btn"
              onClick={() => setUserMenuOpen((v) => !v)}
            >
              <span>👤 User</span>
              <span
                style={{
                  transform: userMenuOpen ? "rotate(90deg)" : "rotate(0deg)",
                  transition: "transform 0.25s ease",
                  display: "inline-block",
                  fontSize: "18px",
                }}
              >
                ›
              </span>
            </button>

            <div
              className="nav-submenu"
              style={{
                maxHeight: userMenuOpen ? "200px" : "0px",
                opacity: userMenuOpen ? 1 : 0,
                overflow: "hidden",
                transition: "max-height 0.3s ease, opacity 0.25s ease",
              }}
            >
              {userLinks.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={handleNavClick}
                  className="nav-link nav-sublink"
                >
                  <span>{item.emoji} {item.label}</span>
                  <GoArrowUpRight size={14} />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: "auto" }}>
          <button className="theme-button" onClick={toggleTheme}>
            {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
          </button>
          {user && (
            <button className="theme-button mt-2" onClick={handleLogout}>
              🚪 Logout ({user.username})
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default CardNavbar;