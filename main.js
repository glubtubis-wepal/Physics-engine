function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const b of balls) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#4af";
    ctx.fill();
  }
}

function loop() {
  updatePhysics();
  draw();
  requestAnimationFrame(loop);
}

// Start
createBall(200, 200);
createBall(300, 200);
loop()
