// ===== Canvas Setup =====
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

// ===== Physics Settings =====
const gravity = 0.6;
const friction = 0.99;
const bounce = 0.7;
const maxThrowPower = 25;

// ===== Objects =====
const balls = [];
const initialPositions = [];

function spawnBall(x, y) {
  const ball = {
    x, y,
    vx: 0, vy: 0,
    radius: 20,
    selected: false,
    tapCount: 0,
    lastTap: 0
  };
  balls.push(ball);
  initialPositions.push({ x, y });
}

// Start with some balls
spawnBall(200, 200);
spawnBall(300, 200);
spawnBall(400, 200);

let selectedBall = null;
let dragStart = null;
let dragCurrent = null;

// ===== Modes =====
let spawnMode = false;
document.getElementById("spawnMode").addEventListener("click", () => {
  spawnMode = !spawnMode;
  document.getElementById("spawnMode").innerText = "Spawn Mode: " + (spawnMode ? "ON" : "OFF");
});

document.getElementById("reset").addEventListener("click", () => {
  balls.length = 0;
  initialPositions.length = 0;
  spawnBall(200, 200);
  spawnBall(300, 200);
  spawnBall(400, 200);
});

// Prevent scrolling
document.body.addEventListener("touchmove", e => e.preventDefault(), { passive: false });

let lastTapTime = 0;

// ===== Touch Events =====
canvas.addEventListener("touchstart", e => {
  const touch = e.touches[0];
  const x = touch.clientX;
  const y = touch.clientY;

  if (spawnMode) {
    spawnBall(x, y);
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
          resetDrag();
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
  if (now - lastTapTime < 300) spawnBall(x, y);
  lastTapTime = now;
});

canvas.addEventListener("touchmove", e => {
  const touch = e.touches[0];
  dragCurrent = { x: touch.clientX, y: touch.clientY };

  if (spawnMode) {
    spawnBall(dragCurrent.x, dragCurrent.y);
  }
});

canvas.addEventListener("touchend", () => {
  if (!selectedBall || !dragStart || !dragCurrent) {
    resetDrag();
    return;
  }

  const dx = dragStart.x - dragCurrent.x;
  const dy = dragStart.y - dragCurrent.y;

  selectedBall.vx += dx * 0.15;
  selectedBall.vy += dy * 0.15;

  selectedBall.selected = false;
  resetDrag();
});

function resetDrag() {
  selectedBall = null;
  dragStart = null;
  dragCurrent = null;
}

// ===== Physics Step =====
function physicsStep() {
  // Apply gravity & move
  for (const ball of balls) {
    ball.vy += gravity;
    ball.x += ball.vx;
    ball.y += ball.vy;
    ball.vx *= friction;
    ball.vy *= friction;

    // Wall collisions
    if (ball.x - ball.radius < 0) { ball.x = ball.radius; ball.vx *= -bounce; }
    if (ball.x + ball.radius > canvas.width) { ball.x = canvas.width - ball.radius; ball.vx *= -bounce; }
    if (ball.y + ball.radius > canvas.height) { ball.y = canvas.height - ball.radius; ball.vy *= -bounce; }
  }

  // Ball-to-ball collisions (stable)
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      collideBalls(balls[i], balls[j]);
    }
  }
}

// ===== Stable Ball Collision =====
function collideBalls(b1, b2) {
  const dx = b2.x - b1.x;
  const dy = b2.y - b1.y;
  const dist = Math.hypot(dx, dy);
  const minDist = b1.radius + b2.radius;

  if (dist < minDist && dist > 0) {
    // Separate balls
    const overlap = (minDist - dist) / 2;
    const nx = dx / dist;
    const ny = dy / dist;

    b1.x -= nx * overlap;
    b1.y -= ny * overlap;
    b2.x += nx * overlap;
    b2.y += ny * overlap;

    // Elastic collision
    const kx = b1.vx - b2.vx;
    const ky = b1.vy - b2.vy;
    const p = 2 * (kx * nx + ky * ny) / 2; // equal mass
    b1.vx -= p * nx;
    b1.vy -= p * ny;
    b2.vx += p * nx;
    b2.vy += p * ny;
  }
}

// ===== Render =====
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Trajectory predictor
  if (selectedBall && dragStart && dragCurrent) {
    let px = selectedBall.x;
    let py = selectedBall.y;
    let vx = (dragStart.x - dragCurrent.x) * 0.15;
    let vy = (dragStart.y - dragCurrent.y) * 0.15;

    ctx.strokeStyle = "rgba(255,255,255,0.6)";
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let t = 0; t < 60; t++) {
      vx *= friction;
      vy *= friction;
      vy += gravity;
      px += vx;
      py += vy;

      if (t === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);

      if (py + selectedBall.radius > canvas.height) {
        py = canvas.height - selectedBall.radius;
        vy *= -bounce;
      }
    }

    ctx.stroke();
  }

  // Draw balls
  for (const ball of balls) {
    ctx.fillStyle = ball.selected ? "#ff0" : "#4af";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ===== Game Loop =====
function gameLoop() {
  physicsStep();
  render();
  requestAnimationFrame(gameLoop);
}

gameLoop();
