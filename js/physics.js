function resolveBallCollision(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy);
  const minDist = a.radius + b.radius;

  if (dist === 0 || dist >= minDist) return;

  // Normal vector
  const nx = dx / dist;
  const ny = dy / dist;

  // Tangent vector
  const tx = -ny;
  const ty = nx;

  // Separate overlap COMPLETELY
  const overlap = minDist - dist;
  a.x -= nx * overlap / 2;
  a.y -= ny * overlap / 2;
  b.x += nx * overlap / 2;
  b.y += ny * overlap / 2;

  // Project velocities onto normal & tangent
  const vAn = a.vx * nx + a.vy * ny;
  const vAt = a.vx * tx + a.vy * ty;
  const vBn = b.vx * nx + b.vy * ny;
  const vBt = b.vx * tx + b.vy * ty;

  // Swap NORMAL velocities (equal mass elastic collision)
  const vAnAfter = vBn;
  const vBnAfter = vAn;

  // Convert back to x/y
  a.vx = vAnAfter * nx + vAt * tx;
  a.vy = vAnAfter * ny + vAt * ty;
  b.vx = vBnAfter * nx + vBt * tx;
  b.vy = vBnAfter * ny + vBt * ty;
}
