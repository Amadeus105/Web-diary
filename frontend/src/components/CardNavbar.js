import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Link, useNavigate } from "react-router-dom";
import { GoArrowUpRight } from "react-icons/go";
import { useAuth } from "../context/AuthContext";
import "./CardNavbar.css";

const CardNavbar = ({ theme, toggleTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const sidebarRef = useRef(null);
  const overlayRef = useRef(null);
  const tlRef = useRef(null);

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
    if (!isOpen) { tl.play(); setIsOpen(true); }
    else { tl.reverse(); setIsOpen(false); }
  };

  const handleLogout = () => {
    logout();
    toggleMenu();
    navigate("/login");
  };

  const navItems = [
    { label: "Home", to: "/" },
    { label: "Completed", to: "/completed" },
    { label: "Suggestions", to: "/suggestions" },
    { label: "About", to: "/about" },
    { label: "Catalog", to: "/catalog" },
    ...(user?.is_admin ? [{ label: "Admin", to: "/admin" }] : []),
  ];

  return (
    <>
      <div className="hamburger-button" onClick={toggleMenu}>
        <div className={`line ${isOpen ? "rotate1" : ""}`} />
        <div className={`line ${isOpen ? "rotate2" : ""}`} />
      </div>

      <div ref={overlayRef} className="overlay" onClick={toggleMenu} />

      <div ref={sidebarRef} className="sidebar">
        <h2 className="logo">🎮 Game Diary</h2>

        <div className="nav-links">
          {navItems.map((item) => (
            <Link key={item.label} to={item.to} onClick={toggleMenu} className="nav-link">
              {item.label}
              <GoArrowUpRight />
            </Link>
          ))}
        </div>

        <button className="theme-button" onClick={toggleTheme}>
          {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
        </button>

        {user && (
          <button className="theme-button mt-2" onClick={handleLogout}>
            🚪 Logout ({user.username})
          </button>
        )}
      </div>
    </>
  );
};

export default CardNavbar;