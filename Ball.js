const balls = [];

function createBall(x, y) {
  balls.push({
    x, y,
    vx: 0,
    vy: 0,
    radius: 20,
    selected: false
  });

