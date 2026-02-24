import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Link } from "react-router-dom";
import { GoArrowUpRight } from "react-icons/go";
import "./CardNavbar.css";

const CardNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState("light"); // theme state

  const sidebarRef = useRef(null);
  const overlayRef = useRef(null);
  const tlRef = useRef(null);

  useLayoutEffect(() => {
    const sidebar = sidebarRef.current;
    const overlay = overlayRef.current;

    gsap.set(sidebar, { x: "-100%" });
    gsap.set(overlay, { opacity: 0, pointerEvents: "none" });

    const tl = gsap.timeline({ paused: true });

    tl.to(sidebar, {
      x: "0%",
      duration: 0.4,
      ease: "power3.out",
    });

    tl.to(
      overlay,
      {
        opacity: 1,
        pointerEvents: "auto",
        duration: 0.3,
      },
      0
    );

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
    }
  };

const toggleTheme = () => {
  const newTheme = theme === "light" ? "dark" : "light";
  setTheme(newTheme);

  document.documentElement.setAttribute("data-theme", newTheme);
};
  const items = [
    { label: "Home", to: "/" },
    { label: "Completed", to: "/completed" },
    { label: "About", to: "/about" },
  ];

  return (
    <>
      {/* Hamburger Button */}
      <div className="hamburger-button" onClick={toggleMenu}>
        <div className={`line ${isOpen ? "rotate1" : ""}`} />
        <div className={`line ${isOpen ? "rotate2" : ""}`} />
      </div>

      {/* Overlay */}
      <div ref={overlayRef} className="overlay" onClick={toggleMenu} />

      {/* Sidebar */}
      <div ref={sidebarRef} className="sidebar">
        <h2 className="logo">🎮 Game Diary</h2>

        <div className="nav-links">
          {items.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              onClick={toggleMenu}
              className="nav-link"
            >
              {item.label}
              <GoArrowUpRight />
            </Link>
          ))}
        </div>

        {/* Dark/Light Mode Button */}
        <button className="theme-button" onClick={toggleTheme}>
          {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
        </button>
      </div>
    </>
  );
};

export default CardNavbar;