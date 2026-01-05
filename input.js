let spawnMode = false;
let bombMode = false;

document.getElementById("spawnMode").onclick = () => {
  spawnMode = !spawnMode;
  document.getElementById("spawnMode").innerText =
    "Spawn Mode: " + (spawnMode ? "ON" : "OFF");
};

document.getElementById("bombMode").onclick = () => {
  bombMode = !bombMode;
  document.getElementById("bombMode").innerText =
    "Bomb Mode: " + (bombMode ? "ON" : "OFF");
};

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
  }
});
