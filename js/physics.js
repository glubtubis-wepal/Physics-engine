const gravity = 0.6;
const friction = 0.99;
const bounce = 0.8;

function updatePhysics() {
  for (const b of balls) {
    b.vy += gravity;
    b.x += b.vx;
    b.y += b.vy;
    b.vx *= friction;
    b.vy *= friction;

    if (b.x - b.radius < 0) { b.x = b.radius; b.vx *= -bounce; }
    if (b.x + b.radius > canvas.width) { b.x = canvas.width - b.radius; b.vx *= -bounce; }
    if (b.y + b.radius > canvas.height) { b.y = canvas.height - b.radius; b.vy *= -bounce; }
  }

  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      resolveBallCollision(balls[i], balls[j]);
    }
  }
}

// Stable elastic collision
function resolveBallCollision(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy);
  const minDist = a.radius + b.radius;

  if (dist < minDist && dist > 0) {
    const nx = dx / dist;
    const ny = dy / dist;
    const overlap = (minDist - dist) / 2;

    // Separate
    a.x -= nx * overlap;
    a.y -= ny * overlap;
    b.x += nx * overlap;
    b.y += ny * overlap;

    // Elastic velocities
    const dvx = a.vx - b.vx;
    const dvy = a.vy - b.vy;
    const dot = dvx * nx + dvy * ny;
    if (dot > 0) return;

    const impulse = 2 * dot / 2; // equal mass
    a.vx -= impulse * nx;
    a.vy -= impulse * ny;
    b.vx += impulse * nx;
    b.vy += impulse * ny;
  }
}
