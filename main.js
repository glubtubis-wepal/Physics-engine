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
const timeStep = 1; // for simplicity

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
    canDelete: false,
    tapCount: 0,
    lastTap: 0
  });
}

// Start with a few balls
spawnBall(200, 200);
spawnBall(300, 200);
spawnBall(400, 200);

let selectedBall = null;

// ===== Touch Handling =====
let dragStart = null;
let dragCurrent = null;
let holdTimer = null;

document.body.addEventListener("touchmove", e => e.preventDefault(), { passive: false });

canvas.addEventListener("touchstart", e => {
  const touch = e.touches[0];
  const x = touch.clientX;
  const y = touch.clientY;

  selectedBall = null;

  for (const ball of balls) {
    const dx = x - ball.x;
    const dy = y - ball.y;
    if (Math.hypot(dx, dy) <= ball.radius) {
      selectedBall = ball;
      ball.selected = true;
      dragStart = { x, y };
      dragCurrent = { x, y };

      timeScale = 0.2;

      ball.canDelete = true;

      // Long press cancel (optional)
      holdTimer = setTimeout(() => {
        if (ball && ball.canDelete) {
          balls.splice(balls.indexOf(ball), 1);
          resetDrag();
        }
      }, 700);

      // Triple tap logic
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

  // cancel delete if moving
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

  if (!selectedBall.canDelete) {
    let dx = dragStart.x - dragCurrent.x;
    let dy = dragStart.y - dragCurrent.y;

    // Clamp throw
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

// Reset drag vars
function resetDrag() {
  selectedBall = null;
  dragStart = null;
  dragCurrent = null;
  timeScale = 1;
}

// ===== Physics =====
function physicsStep() {
  // Apply physics to each ball
  for (const ball of balls) {
    ball.vy += gravity * timeScale;

    ball.x += ball.vx * timeScale;
    ball.y += ball.vy * timeScale;

    ball.vx *= friction;
    ball.vy *= friction;

    // Walls
    if (ball.x - ball.radius < 0) {
      ball.x = ball.radius;
      ball.vx *= -bounce;
    }
    if (ball.x + ball.radius > canvas.width) {
      ball.x = canvas.width - ball.radius;
      ball.vx *= -bounce;
    }
    if (ball.y + ball.radius > canvas.height) {
      ball.y = canvas.height - ball.radius;
      ball.vy *= -bounce;
    }
  }

  // Ball-to-ball collisions
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      resolveCollision(balls[i], balls[j]);
    }
  }
}

// ===== Collision Helper =====
function resolveCollision(b1, b2) {
  const dx = b2.x - b1.x;
  const dy = b2.y - b1.y;
  const dist = Math.hypot(dx, dy);
  const minDist = b1.radius + b2.radius;

  if (dist < minDist && dist > 0) {
    const overlap = 0.5 * (minDist - dist);

    const nx = dx / dist;
    const ny = dy / dist;

    // Separate balls
    b1.x -= nx * overlap;
    b1.y -= ny * overlap;
    b2.x += nx * overlap;
    b2.y += ny * overlap;

    // Simple elastic collision
    const tx = -ny;
    const ty = nx;

    const dpTan1 = b1.vx * tx + b1.vy * ty;
    const dpTan2 = b2.vx * tx + b2.vy * ty;

    const dpNorm1 = b1.vx * nx + b1.vy * ny;
    const dpNorm2 = b2.vx * nx + b2.vy * ny;

    const m1 = dpNorm2;
    const m2 = dpNorm1;

    b1.vx = tx * dpTan1 + nx * m1;
    b1.vy = ty * dpTan1 + ny * m1;
    b2.vx = tx * dpTan2 + nx * m2;
    b2.vy = ty * dpTan2 + ny * m2;
  }
}

// ===== Render =====
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw trajectory if dragging
  if (dragStart && dragCurrent) {
    const dx = dragStart.x - dragCurrent.x;
    const dy = dragStart.y - dragCurrent.y;

    let px = selectedBall.x;
    let py = selectedBall.y;
    let vx = dx * 0.15;
    let vy = dy * 0.15;

    ctx.strokeStyle = "rgba(255,255,255,0.6)";
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let t = 0; t < 60; t++) { // simulate ~60 frames
      vx *= friction;
      vy *= friction;
      vy += gravity * 0.2; // slow motion sim
      px += vx;
      py += vy;

      if (t === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);

      // Stop if hits floor
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

let lastTapTime = 0;
gameLoop();
