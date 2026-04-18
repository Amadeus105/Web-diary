import LogoLoop from "./LogoLoop";
import {
  SiReact, SiPython, SiFastapi, SiPostgresql,
  SiDocker, SiNginx, SiGithub, SiHtml5,
  SiJavascript
} from "react-icons/si";
import { GiBookCover } from "react-icons/gi";
import { MdMusicNote, MdSportsEsports } from "react-icons/md";

const techLogos = [
  { node: <SiReact color="#61DAFB" />, title: "React" },
  { node: <SiPython color="#3776AB" />, title: "Python" },
  { node: <SiFastapi color="#009688" />, title: "FastAPI" },
  { node: <SiPostgresql color="#336791" />, title: "PostgreSQL" },
  { node: <SiDocker color="#2496ED" />, title: "Docker" },
  { node: <SiNginx color="#009639" />, title: "Nginx" },
  { node: <SiGithub color="#333" />, title: "GitHub" },
  { node: <SiHtml5 color="#E34F26" />, title: "HTML5" },
  { node: <SiJavascript color="#F7DF1E" />, title: "JavaScript" },
  { node: <GiBookCover color="#8B4513" />, title: "Books" },
  { node: <MdSportsEsports color="#7c3aed" />, title: "Games" },
  { node: <MdMusicNote color="#1db954" />, title: "Music" },
  { node: <span style={{ fontSize: "24px" }}>🤖</span>, title: "OpenRouter" },
  { node: <span style={{ fontSize: "24px" }}>✦</span>, title: "Claude" },
];

const Footer = () => (
  <footer style={{
    position: "relative",
    zIndex: 1,
    borderTop: "1px solid var(--block-border)",
    paddingTop: "20px",
    marginTop: "40px",
    background: "var(--block-bg)",
    backdropFilter: "blur(10px)",
  }}>
    <div style={{ height: "60px", overflow: "hidden", marginBottom: "16px" }}>
      <LogoLoop
        logos={techLogos}
        speed={80}
        direction="left"
        logoHeight={30}
        gap={40}
        hoverSpeed={0}
        scaleOnHover
        fadeOut
        fadeOutColor="var(--bg-color)"
      />
    </div>
    <p style={{
      textAlign: "center",
      color: "var(--text-color)",
      opacity: 0.5,
      fontSize: "13px",
      margin: "0 0 16px 0"
    }}>
      Web Diary © {new Date().getFullYear()} — Built with React, FastAPI, PostgreSQL & Docker
    </p>
  </footer>
);

export default Footer;