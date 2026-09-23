const COLORS = ["#42d3bd", "#6ee7d5", "#fbbf24", "#f472b6", "#60a5fa", "#a78bfa"];

export function launchConfetti(canvas, { duration = 2600, count = 160 } = {}) {
  const context = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  context.scale(dpr, dpr);

  const particles = Array.from({ length: count }, () => ({
    x: Math.random() * window.innerWidth,
    y: -20 - Math.random() * window.innerHeight * 0.3,
    size: 6 + Math.random() * 6,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    speedY: 2 + Math.random() * 3,
    speedX: -1.5 + Math.random() * 3,
    rotation: Math.random() * 360,
    spin: -6 + Math.random() * 12,
  }));

  const start = performance.now();

  function frame(now) {
    const elapsed = now - start;
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (const particle of particles) {
      particle.x += particle.speedX;
      particle.y += particle.speedY;
      particle.rotation += particle.spin;

      context.save();
      context.translate(particle.x, particle.y);
      context.rotate((particle.rotation * Math.PI) / 180);
      context.fillStyle = particle.color;
      context.fillRect(-particle.size / 2, -particle.size / 4, particle.size, particle.size / 2);
      context.restore();
    }

    if (elapsed < duration) {
      requestAnimationFrame(frame);
    } else {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }

  requestAnimationFrame(frame);
}
