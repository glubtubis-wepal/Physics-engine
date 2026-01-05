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

// ===== Objects (balls) =====
const balls = [];

for (let i = 0; i < 5; i++) {
  balls.push({
    x: 100 + i * 60,
    y: 200,
    vx: 0,
    vy: 0,
    radius: 20,
    selected: false
  });
}

let selectedBall = null;

// ===== Touch Drag =====
let dragStart = null;
let dragCurrent = null;

// Prevent scrolling
document.body.addEventListener("touchmove", e => e.preventDefault(), { passive: false });

// ===== Touch Events =====
canvas.addEventListener("touchstart", e => {
  const touch = e.touches[0];
  const x = touch.clientX;
  const y = touch.clientY;

  selectedBall = null;

  for (const ball of balls) {
    const dx = x - ball.x;
    const dy = y - ball.y;
    if (Math.sqrt(dx * dx + dy * dy) <= ball.radius) {
      selectedBall = ball;
      ball.selected = true;
      dragStart = { x, y };
      dragCurrent = { x, y };
      break;
    }
  }
});

canvas.addEventListener("touchmove", e => {
  if (!selectedBall) return;
  const touch = e.touches[0];
  dragCurrent = {
    x: touch.clientX,
    y: touch.clientY
  };
});

canvas.addEventListener("touchend", () => {
  if (!selectedBall || !dragStart || !dragCurrent) return;

  const dx = dragStart.x - dragCurrent.x;
  const dy = dragStart.y - dragCurrent.y;

  // Apply throw force
  selectedBall.vx += dx * 0.15;
  selectedBall.vy += dy * 0.15;

  selectedBall.selected = false;
  selectedBall = null;
  dragStart = null;
  dragCurrent = null;
});

// ===== Physics Step =====
function physicsStep() {
  for (const ball of balls) {
    ball.vy += gravity;

    ball.x += ball.vx;
    ball.y += ball.vy;

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

  // Draw drag line
  if (dragStart && dragCurrent) {
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(dragStart.x, dragStart.y);
    ctx.lineTo(dragCurrent.x, dragCurrent.y);
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
