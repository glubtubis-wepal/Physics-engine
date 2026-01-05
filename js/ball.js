const balls = [];
const initialPositions = [];

function createBall(x, y) {
  const ball = {
    x, y,
    vx: 0,
    vy: 0,
    radius: 20,
    selected: false,
    tapCount: 0,
    lastTap: 0
  };
  balls.push(ball);
  initialPositions.push({x, y});
}

