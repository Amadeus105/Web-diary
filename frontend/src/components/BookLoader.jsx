const STYLES = `
.book-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.book {
  width: 64px;
  height: 80px;
  position: relative;
  perspective: 400px;
  margin-left: 53px;
}

.book-cover {
  width: 100%;
  height: 100%;
  background: linear-gradient(160deg, #7c3aed, #5b21b6);
  border-radius: 3px 10px 10px 3px;
  position: absolute;
  top: 0; left: 0;
  box-shadow: 6px 6px 24px rgba(124,58,237,0.45);
  overflow: hidden;
}

.book-lines {
  position: absolute;
  top: 50%; left: 10px; right: 10px;
  transform: translateY(-50%);
  display: flex; flex-direction: column; gap: 7px;
}

.book-line {
  height: 2px;
  background: rgba(255,255,255,0.25);
  border-radius: 2px;
  animation: shimmer 1.6s ease-in-out infinite;
}

.book-line:nth-child(1) { width: 75%; animation-delay: 0s; }
.book-line:nth-child(2) { width: 100%; animation-delay: 0.12s; }
.book-line:nth-child(3) { width: 55%; animation-delay: 0.24s; }
.book-line:nth-child(4) { width: 88%; animation-delay: 0.36s; }
.book-line:nth-child(5) { width: 65%; animation-delay: 0.48s; }

.book-page {
  width: 100%;
  height: 100%;
  border-radius: 3px 10px 10px 3px;
  position: absolute;
  top: 0; left: 0;
  transform-origin: left center;
  transform-style: preserve-3d;
  animation: flipPage 1.6s ease-in-out infinite;
}

.book-page:nth-child(2) {
  background: #f0ebff;
  animation-delay: 0s;
  box-shadow: 2px 0 10px rgba(0,0,0,0.12);
}
.book-page:nth-child(3) {
  background: #e8e0ff;
  animation-delay: 0.12s;
  box-shadow: 2px 0 8px rgba(0,0,0,0.09);
}
.book-page:nth-child(4) {
  background: #ddd5ff;
  animation-delay: 0.24s;
  box-shadow: 2px 0 6px rgba(0,0,0,0.07);
}

@keyframes flipPage {
  0%        { transform: rotateY(0deg); }
  45%, 100% { transform: rotateY(-170deg); }
}

@keyframes shimmer {
  0%, 100% { opacity: 0.3; }
  50%       { opacity: 0.8; }
}

.book-text {
  color: var(--text-color);
  opacity: 0.4;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.5px;
  animation: fadeText 1.6s ease-in-out infinite;
}

@keyframes fadeText {
  0%, 100% { opacity: 0.25; }
  50%       { opacity: 0.55; }
}
`;

const BookLoader = ({ text = "Loading...", height = "100vh" }) => (
  <>
    <style>{STYLES}</style>
    <div className="book-loader" style={{ height }}>
      <div className="book">
        <div className="book-cover">
          <div className="book-lines">
            <div className="book-line" />
            <div className="book-line" />
            <div className="book-line" />
            <div className="book-line" />
            <div className="book-line" />
          </div>
        </div>
        <div className="book-page" />
        <div className="book-page" />
        <div className="book-page" />
      </div>
      <span className="book-text">{text}</span>
    </div>
  </>
);

export default BookLoader;
