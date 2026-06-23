// Lightweight dependency-free confetti burst for the result reveal.
// Honors prefers-reduced-motion and cleans up its own canvas.

const COLORS = ['#d9ff56', '#ff8d75', '#8de5f4', '#ffd65a', '#243347'];
const prefersReducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const createCanvas = () => {
  const canvas = document.createElement('canvas');
  Object.assign(canvas.style, {
    position: 'fixed',
    inset: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: '50',
  });
  canvas.setAttribute('aria-hidden', 'true');
  document.body.append(canvas);
  return canvas;
};

const makePiece = (width, height) => ({
  x: width / 2 + (Math.random() - 0.5) * width * 0.6,
  y: height * 0.32 + (Math.random() - 0.5) * 80,
  vx: (Math.random() - 0.5) * 13,
  vy: Math.random() * -13 - 5,
  size: 7 + Math.random() * 8,
  rotation: Math.random() * Math.PI,
  spin: (Math.random() - 0.5) * 0.3,
  color: COLORS[Math.floor(Math.random() * COLORS.length)],
});

export const burstConfetti = ({ count = 130, duration = 2600 } = {}) => {
  if (prefersReducedMotion()) return;

  const canvas = createCanvas();
  const context = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width = window.innerWidth;
  let height = window.innerHeight;

  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize);

  const pieces = Array.from({ length: count }, () => makePiece(width, height));
  const start = performance.now();

  const tick = (now) => {
    const elapsed = now - start;
    context.clearRect(0, 0, width, height);
    pieces.forEach((piece) => {
      piece.vy += 0.32; // gravity
      piece.vx *= 0.99;
      piece.x += piece.vx;
      piece.y += piece.vy;
      piece.rotation += piece.spin;
      context.save();
      context.translate(piece.x, piece.y);
      context.rotate(piece.rotation);
      context.globalAlpha = Math.max(0, 1 - elapsed / duration);
      context.fillStyle = piece.color;
      context.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.6);
      context.restore();
    });

    if (elapsed < duration) {
      requestAnimationFrame(tick);
    } else {
      window.removeEventListener('resize', resize);
      canvas.remove();
    }
  };

  requestAnimationFrame(tick);
};
