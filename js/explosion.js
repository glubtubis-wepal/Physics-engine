function explode(x, y, radius = 120, power = 18) {
  for (const b of balls) {
    const dx = b.x - x;
    const dy = b.y - y;
    const dist = Math.hypot(dx, dy);

    if (dist < radius && dist > 0) {
      const force = (1 - dist / radius) * power;
      b.vx += (dx / dist) * force;
      b.vy += (dy / dist) * force;
    }
  }

  // Visual effect
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,100,0,0.4)";
  ctx.lineWidth = 4;
  ctx.stroke();
}
