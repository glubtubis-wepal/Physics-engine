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

// Time scaling
let timeScale = 1;

// ===== Objects =====
const balls = [];

function spawnBall(x, y) {
  balls.push({
    x,
    y,
    vx: 0,
    vy: 0,
    radius: 20,
    selected: false,
    canDelete: false, // flag for long-press delete
  });
}

// Start with a few
spawnBall(200, 200);
spawnBall(300, 200);
spawnBall(400, 200);

let selectedBall = null;

// ===== Touch Handling =====
let dragStart = null;
let dragCurrent = null;
let lastTapTime = 0;
let holdTimer = null;

document.body.addEventListener("touchmove", e => e.preventDefault(), { passive: false });

canvas.addEventListener("touchstart", e => {
  const touch = e.touches[0];
  const x = touch.clientX;
  const y = touch.clientY;

  selectedBall = null;

  // Check ball selection
  for (const ball of balls) {
    const dx = x - ball.x;
    const dy = y - ball.y;
    if (Math.hypot(dx, dy) <= ball.radius) {
      selectedBall = ball;
      ball.selected = true;
      dragStart = { x, y };
      dragCurrent = { x, y };

      // Slow motion ON
      timeScale = 0.2;

      // Only allow delete if long press without moving much
      ball.canDelete = true;
      holdTimer = setTimeout(() => {
        if (ball && ball.canDelete) {
          balls.splice(balls.indexOf(ball), 1);
          resetDrag();
        }
      }, 700);

      return;
    }
  }

  // Double tap empty space = spawn
  const now = Date.now();
  if (now - lastTapTime < 300) {
    spawnBall(x, y);
  }
  lastTapTime = now;
});

canvas.addEventListener("touchmove", e => {
  if (!selectedBall) return;
  const touch = e.touches[0];
  dragCurrent = {
    x: touch.clientX,
    y: touch.clientY
  };

  // If dragging more than a few pixels, cancel delete
  if (selectedBall.canDelete) {
    const dx = dragCurrent.x - dragStart.x;
    const dy = dragCurrent.y - dragStart.y;
    if (Math.hypot(dx, dy) > 5) selectedBall.canDelete = false;
  }
});

canvas.addEventListener("touchend", () => {
  clearTimeout(holdTimer);

  if (!selectedBall || !dragStart || !dragCurrent) {
    timeScale = 1;
    resetDrag();
    return;
  }

  // Apply throw if not deleted
  if (!selectedBall.canDelete) {
    let dx = dragStart.x - dragCurrent.x;
    let dy = dragStart.y - dragCurrent.y;

    // Clamp power
    const mag = Math.hypot(dx, dy);
    if (mag > maxThrowPower * 10) {
      dx = (dx / mag) * maxThrowPower * 10;
      dy = (dy / mag) * maxThrowPower * 10;
    }

    selectedBall.vx += dx * 0.15;
    selectedBall.vy += dy * 0.15;
  }

  selectedBall.selected = false;
  resetDrag();
});

// Helper to reset drag variables
function resetDrag() {
  selectedBall = null;
  dragStart = null;
  dragCurrent = null;
  timeScale = 1;
}

// ===== Physics =====
function physicsStep() {
  for (const ball of balls) {
    ball.vy += gravity * timeScale;

    ball.x += ball.vx * timeScale;
    ball.y += ball.vy * timeScale;

    ball.vx *= friction;
    ball.vy *= friction;

    // Floor
    if (ball.y + ball.radius > canvas.height) {
      ball.y = canvas.height - ball.radius;
      ball.vy *= -bounce;
    }

    // Walls
    if (ball.x - ball.radius < 0) {
      ball.x = ball.radius;
      ball.vx *= -bounce;
    }
    if (ball.x + ball.radius > canvas.width) {
      ball.x = canvas.width - ball.radius;
      ball.vx *= -bounce;
    }
  }
}

// ===== Render =====
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Aim line
  if (dragStart && dragCurrent) {
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(dragStart.x, dragStart.y);
    ctx.lineTo(dragCurrent.x, dragCurrent.y);
    ctx.stroke();
  }

  // Balls
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
