import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

const ParticlesBackground = () => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setInit(true));
  }, []);

  const options = useMemo(() => ({
    background: { color: { value: "transparent" } }, // let App.css handle bg color
    fpsLimit: 60,           // was 120 — halves GPU compositing work
    particles: {
      color: { value: "#ffffff" },
      move: {
        enable: true,
        speed: 0.4,         // slightly slower feels calmer too
      },
      number: {
        value: 72,          // was 200 — biggest single win
        density: { enable: true, area: 900 },
      },
      opacity: {
        value: { min: 0.15, max: 0.45 }, // was flat 0.5
      },
      size: { value: { min: 1, max: 2 } },
    },
    detectRetina: false,    // was true — retina doubles particle count internally
  }), []);

  if (!init) return null;

  return (
    <Particles
      id="tsparticles"
      options={options}
      style={{
        position: "fixed",
        top: 0, left: 0,
        width: "100vw", height: "100vh",
        zIndex: -1,
        pointerEvents: "none",   // ensure it never blocks clicks
      }}
    />
  );
};

export default ParticlesBackground;