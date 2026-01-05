// ===== Canvas Setup =====
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

// ===== Player Physics Object =====
const player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  vx: 0,
  vy: 0,
  radius: 20
};

// ===== Physics Settings =====
const gravity = 0.6;
const friction = 0.92;
const moveForce = 1.2;

// ===== Input =====
let moveLeft = false;
let moveRight = false;

// Touch buttons (must exist in HTML)
const leftBtn = document.getElementById("left");
const rightBtn = document.getElementById("right");

leftBtn.addEventListener("touchstart", () => moveLeft = true);
leftBtn.addEventListener("touchend", () => moveLeft = false);

rightBtn.addEventListener("touchstart", () => moveRight = true);
rightBtn.addEventListener("touchend", () => moveRight = false);

// Prevent scrolling
document.body.addEventListener("touchmove", e => e.preventDefault(), { passive: false });

// ===== Physics Step =====
function physicsStep() {
  if (moveLeft) player.vx -= moveForce;
  if (moveRight) player.vx += moveForce;

  player.vy += gravity;

  player.x += player.vx;
  player.y += player.vy;

  player.vx *= friction;

  // Floor collision
  if (player.y + player.radius > canvas.height) {
    player.y = canvas.height - player.radius;
    player.vy *= -0.6;
  }

  // Wall collisions
  if (player.x - player.radius < 0) {
    player.x = player.radius;
    player.vx *= -0.5;
  }

  if (player.x + player.radius > canvas.width) {
    player.x = canvas.width - player.radius;
    player.vx *= -0.5;
  }
}

// ===== Render =====
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#4af";
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  ctx.fill();
}

// ===== Game Loop =====
function gameLoop() {
  physicsStep();
  render();
  requestAnimationFrame(gameLoop);
}

gameLoop();
