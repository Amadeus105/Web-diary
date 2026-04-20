import { useRef, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';
import './ChromaGrid.css';

export const ChromaGrid = ({
  items,
  className = '',
  radius = 300,
  columns = 3,
  rows = 2,
  damping = 0.45,
  fadeOut = 0.6,
  ease = 'power3.out'
}) => {
  const rootRef  = useRef(null);
  const fadeRef  = useRef(null);
  const setX     = useRef(null);
  const setY     = useRef(null);
  const pos      = useRef({ x: 0, y: 0 });
  const rafId    = useRef(null);          // ← throttle pointer on grid
  const cardRafs = useRef({});            // ← throttle per-card mouse

  const demo = [
    { image: 'https://i.pravatar.cc/300?img=8',  title: 'Alex Rivera',     subtitle: 'Full Stack Developer', handle: '@alexrivera',  borderColor: '#4F46E5', gradient: 'linear-gradient(145deg, #4F46E5, #000)', url: 'https://github.com/' },
    { image: 'https://i.pravatar.cc/300?img=11', title: 'Jordan Chen',     subtitle: 'DevOps Engineer',      handle: '@jordanchen',  borderColor: '#10B981', gradient: 'linear-gradient(210deg, #10B981, #000)', url: 'https://linkedin.com/in/' },
    { image: 'https://i.pravatar.cc/300?img=3',  title: 'Morgan Blake',    subtitle: 'UI/UX Designer',       handle: '@morganblake', borderColor: '#F59E0B', gradient: 'linear-gradient(165deg, #F59E0B, #000)', url: 'https://dribbble.com/' },
    { image: 'https://i.pravatar.cc/300?img=16', title: 'Casey Park',      subtitle: 'Data Scientist',       handle: '@caseypark',   borderColor: '#EF4444', gradient: 'linear-gradient(195deg, #EF4444, #000)', url: 'https://kaggle.com/' },
    { image: 'https://i.pravatar.cc/300?img=25', title: 'Sam Kim',         subtitle: 'Mobile Developer',     handle: '@thesamkim',   borderColor: '#8B5CF6', gradient: 'linear-gradient(225deg, #8B5CF6, #000)', url: 'https://github.com/' },
    { image: 'https://i.pravatar.cc/300?img=60', title: 'Tyler Rodriguez',  subtitle: 'Cloud Architect',     handle: '@tylerrod',    borderColor: '#06B6D4', gradient: 'linear-gradient(135deg, #06B6D4, #000)', url: 'https://aws.amazon.com/' },
  ];
  const data = items?.length ? items : demo;

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    setX.current = gsap.quickSetter(el, '--x', 'px');
    setY.current = gsap.quickSetter(el, '--y', 'px');
    const { width, height } = el.getBoundingClientRect();
    pos.current = { x: width / 2, y: height / 2 };
    setX.current(pos.current.x);
    setY.current(pos.current.y);

    // promote grid to its own compositor layer — eliminates per-frame repaints
    el.style.willChange = 'transform';

    const pendingRafId    = rafId;
    const pendingCardRafs = cardRafs;
    return () => {
      if (pendingRafId.current) cancelAnimationFrame(pendingRafId.current);
      Object.values(pendingCardRafs.current).forEach(id => cancelAnimationFrame(id));
    };
  }, []);

  const moveTo = useCallback((x, y) => {
    gsap.to(pos.current, {
      x, y,
      duration: damping,
      ease,
      onUpdate: () => {
        setX.current?.(pos.current.x);
        setY.current?.(pos.current.y);
      },
      overwrite: true,
    });
  }, [damping, ease]);

  // ── Throttled grid pointer handler ─────────────────────
  const handleMove = useCallback((e) => {
    if (rafId.current) return;           // skip if a frame is already queued
    rafId.current = requestAnimationFrame(() => {
      rafId.current = null;
      const r = rootRef.current?.getBoundingClientRect();
      if (!r) return;
      moveTo(e.clientX - r.left, e.clientY - r.top);
      gsap.to(fadeRef.current, { opacity: 0, duration: 0.25, overwrite: true });
    });
  }, [moveTo]);

  const handleLeave = useCallback(() => {
    gsap.to(fadeRef.current, { opacity: 1, duration: fadeOut, overwrite: true });
  }, [fadeOut]);

  const handleCardClick = useCallback((url) => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  // ── Throttled per-card mouse handler ───────────────────
  const handleCardMove = useCallback((e) => {
    const card = e.currentTarget;
    const idx  = card.dataset.idx;
    if (cardRafs.current[idx]) return;  // skip if frame already queued for this card
    const cx = e.clientX;
    const cy = e.clientY;
    cardRafs.current[idx] = requestAnimationFrame(() => {
      cardRafs.current[idx] = null;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', `${cx - rect.left}px`);
      card.style.setProperty('--mouse-y', `${cy - rect.top}px`);
    });
  }, []);

  return (
    <div
      ref={rootRef}
      className={`chroma-grid ${className}`}
      style={{ '--r': `${radius}px`, '--cols': columns, '--rows': rows }}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      {data.map((c, i) => (
        <article
          key={i}
          data-idx={i}                   // needed for per-card RAF map
          className="chroma-card"
          onMouseMove={handleCardMove}
          onClick={() => handleCardClick(c.url)}
          style={{
            '--card-border':    c.borderColor || 'transparent',
            '--card-gradient':  c.gradient,
            cursor:             c.url ? 'pointer' : 'default',
            willChange:         'transform', // own compositor layer per card
          }}
        >
          <div className="chroma-img-wrapper">
            <img src={c.image} alt={c.title} loading="lazy" decoding="async" />
          </div>
          <footer className="chroma-info">
            <h3 className="name">{c.title}</h3>
            {c.handle   && <span className="handle">{c.handle}</span>}
            <p className="role">{c.subtitle}</p>
            {c.location && <span className="location">{c.location}</span>}
          </footer>
        </article>
      ))}
      <div className="chroma-overlay" />
      <div ref={fadeRef} className="chroma-fade" />
    </div>
  );
};

export default ChromaGrid;