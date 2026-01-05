// Initial balls
createBall(200,200);
createBall(300,200);
createBall(400,200);

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  for (const b of balls) {
    ctx.beginPath();
    ctx.arc(b.x,b.y,b.radius,0,Math.PI*2);
    ctx.fillStyle = b.selected ? "#ff0" : "#4af";
    ctx.fill();
  }

  // Trajectory predictor
  if (selectedBall && dragStart && dragCurrent) {
    let px = selectedBall.x;
    let py = selectedBall.y;
    let vx = (dragStart.x - dragCurrent.x) * 0.15;
    let vy = (dragStart.y - dragCurrent.y) * 0.15;
    ctx.strokeStyle = "rgba(255,255,255,0.6)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let t=0; t<60; t++){
      vx *= friction;
      vy *= friction;
      vy += gravity;
      px += vx; py += vy;
      if (t===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
      if (py + selectedBall.radius > canvas.height) { py = canvas.height-selectedBall.radius; vy*=-bounce; }
    }
    ctx.stroke();
  }
}

function loop(){
  updatePhysics();
  draw();
  requestAnimationFrame(loop);
}

loop();
