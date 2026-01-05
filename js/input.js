// MUST be global
let selectedBall = null;
let dragStart = null;
let dragCurrent = null;

let spawnMode = false;
let bombMode = false;

document.getElementById("spawnMode").onclick = () => {
  spawnMode = !spawnMode;
  document.getElementById("spawnMode").innerText = "Spawn Mode: " + (spawnMode ? "ON" : "OFF");
};

document.getElementById("bombMode").onclick = () => {
  bombMode = !bombMode;
  document.getElementById("bombMode").innerText = "Bomb Mode: " + (bombMode ? "ON" : "OFF");
};

document.getElementById("reset").onclick = () => {
  balls.length = 0;
  initialPositions.length = 0;
  createBall(200,200);
  createBall(300,200);
  createBall(400,200);
};

let selectedBall = null;
let dragStart = null;
let dragCurrent = null;
let lastTapTime = 0;

canvas.addEventListener("touchstart", e => {
  const t = e.touches[0];
  const x = t.clientX;
  const y = t.clientY;

  if (bombMode) {
    explode(x, y);
    return;
  }

  if (spawnMode) {
    createBall(x, y);
    return;
  }

  selectedBall = null;
  for (const ball of balls) {
    const dx = x - ball.x;
    const dy = y - ball.y;
    if (Math.hypot(dx, dy) <= ball.radius) {
      selectedBall = ball;
      ball.selected = true;
      dragStart = { x, y };
      dragCurrent = { x, y };

      // Triple tap delete
      const now = Date.now();
      if (now - ball.lastTap < 500) {
        ball.tapCount++;
        if (ball.tapCount >= 3) {
          balls.splice(balls.indexOf(ball), 1);
          selectedBall = null;
          return;
        }
      } else {
        ball.tapCount = 1;
      }
      ball.lastTap = now;
      return;
    }
  }

  // Double tap empty = spawn
  const now = Date.now();
  if (now - lastTapTime < 300) createBall(x,y);
  lastTapTime = now;
});

canvas.addEventListener("touchmove", e => {
  const t = e.touches[0];
  dragCurrent = { x: t.clientX, y: t.clientY };

  if (spawnMode) createBall(dragCurrent.x, dragCurrent.y);
});

canvas.addEventListener("touchend", () => {
  if (!selectedBall || !dragStart || !dragCurrent) return;
  const dx = dragStart.x - dragCurrent.x;
  const dy = dragStart.y - dragCurrent.y;
  selectedBall.vx += dx * 0.15;
  selectedBall.vy += dy * 0.15;
  selectedBall.selected = false;
  selectedBall = null;
  dragStart = null;
  dragCurrent = null;
});
