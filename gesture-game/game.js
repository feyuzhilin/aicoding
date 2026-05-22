const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");
const video = document.querySelector("#camera");
const visionCanvas = document.querySelector("#visionCanvas");
const vctx = visionCanvas.getContext("2d", { willReadFrequently: true });

const scoreEl = document.querySelector("#score");
const shieldEl = document.querySelector("#shield");
const progressEl = document.querySelector("#progress");
const statusEl = document.querySelector("#cameraStatus");
const gestureEl = document.querySelector("#gestureName");
const meterEl = document.querySelector("#gestureMeter");
const startCameraBtn = document.querySelector("#startCamera");
const calibrateBtn = document.querySelector("#calibrate");
const restartBtn = document.querySelector("#restart");
const briefStartBtn = document.querySelector("#briefStart");
const briefing = document.querySelector("#briefing");

const GAME_W = 1280;
const GAME_H = 720;
const SAMPLE_W = 160;
const SAMPLE_H = 120;

let cameraReady = false;
let calibrated = false;
let skin = null;
let lastTime = performance.now();
let lastShotAt = 0;
let gameOver = false;
let pointerFallback = { active: false, x: GAME_W / 2, y: GAME_H / 2 };

const state = {
  score: 0,
  shield: 100,
  progress: 0,
  shake: 0,
  wave: 1,
  gesture: {
    name: "等待手势",
    confidence: 0,
    center: null,
    tip: null,
    direction: { x: 1, y: 0 },
    gun: 0,
    palm: 0,
    maskCount: 0,
  },
  beams: [],
  particles: [],
  enemies: [],
  cores: [
    { x: 1010, y: 420, r: 44, charge: 0, label: "A" },
    { x: 260, y: 500, r: 38, charge: 0, label: "B" },
  ],
};

function resetGame() {
  state.score = 0;
  state.shield = 100;
  state.progress = 0;
  state.shake = 0;
  state.wave = 1;
  state.beams = [];
  state.particles = [];
  state.enemies = [];
  state.cores.forEach((core) => {
    core.charge = 0;
  });
  gameOver = false;
  for (let i = 0; i < 6; i += 1) spawnEnemy();
  updateHud();
}

function resizeCanvas() {
  const ratio = Math.min(window.innerWidth / GAME_W, window.innerHeight / GAME_H);
  canvas.style.width = `${GAME_W * ratio}px`;
  canvas.style.height = `${GAME_H * ratio}px`;
}

function spawnEnemy() {
  const side = Math.floor(Math.random() * 4);
  const pad = 70;
  const enemy = {
    x: side === 0 ? -pad : side === 1 ? GAME_W + pad : Math.random() * GAME_W,
    y: side === 2 ? -pad : side === 3 ? GAME_H + pad : Math.random() * GAME_H,
    r: 22 + Math.random() * 15,
    hp: 2 + Math.floor(state.wave / 2),
    speed: 26 + Math.random() * 26 + state.wave * 2,
    wobble: Math.random() * Math.PI * 2,
    hue: Math.random() > 0.45 ? "#ff5d73" : "#ffd166",
  };
  state.enemies.push(enemy);
}

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
        width: { ideal: 960 },
        height: { ideal: 720 },
      },
      audio: false,
    });
    video.srcObject = stream;
    await video.play();
    cameraReady = true;
    statusEl.textContent = "摄像头已启动";
    calibrateBtn.disabled = false;
  } catch (error) {
    cameraReady = false;
    statusEl.textContent = "摄像头不可用，可用鼠标测试";
    gestureEl.textContent = "鼠标模拟";
  }
}

function calibrateHand() {
  if (!cameraReady) return;
  vctx.drawImage(video, 0, 0, SAMPLE_W, SAMPLE_H);
  const cx = SAMPLE_W / 2;
  const cy = SAMPLE_H / 2;
  const size = 30;
  const frame = vctx.getImageData(cx - size / 2, cy - size / 2, size, size).data;
  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;
  for (let i = 0; i < frame.length; i += 4) {
    const brightness = frame[i] + frame[i + 1] + frame[i + 2];
    if (brightness > 80) {
      r += frame[i];
      g += frame[i + 1];
      b += frame[i + 2];
      count += 1;
    }
  }
  if (count < 40) {
    statusEl.textContent = "校准失败，请把手放进框内";
    return;
  }
  skin = rgbToYCbCr(r / count, g / count, b / count);
  calibrated = true;
  statusEl.textContent = "校准完成";
}

function rgbToYCbCr(r, g, b) {
  return {
    y: 0.299 * r + 0.587 * g + 0.114 * b,
    cb: 128 - 0.168736 * r - 0.331264 * g + 0.5 * b,
    cr: 128 + 0.5 * r - 0.418688 * g - 0.081312 * b,
  };
}

function detectGesture() {
  if (!cameraReady || !calibrated || !skin || video.readyState < 2) {
    if (pointerFallback.active) {
      const center = { x: pointerFallback.x, y: pointerFallback.y };
      return {
        name: "鼠标模拟",
        confidence: 0.72,
        center,
        tip: { x: pointerFallback.x + 120, y: pointerFallback.y },
        direction: { x: 1, y: 0 },
        gun: 0.72,
        palm: 0,
        maskCount: 0,
      };
    }
    return state.gesture;
  }

  vctx.save();
  vctx.clearRect(0, 0, SAMPLE_W, SAMPLE_H);
  vctx.drawImage(video, 0, 0, SAMPLE_W, SAMPLE_H);
  const frame = vctx.getImageData(0, 0, SAMPLE_W, SAMPLE_H);
  const pixels = frame.data;
  let minX = SAMPLE_W;
  let minY = SAMPLE_H;
  let maxX = 0;
  let maxY = 0;
  let sumX = 0;
  let sumY = 0;
  let count = 0;

  for (let y = 0; y < SAMPLE_H; y += 1) {
    for (let x = 0; x < SAMPLE_W; x += 1) {
      const index = (y * SAMPLE_W + x) * 4;
      const color = rgbToYCbCr(pixels[index], pixels[index + 1], pixels[index + 2]);
      const chroma = Math.hypot(color.cb - skin.cb, color.cr - skin.cr);
      const luma = Math.abs(color.y - skin.y);
      const isSkin = chroma < 18 + Math.max(0, 22 - luma * 0.1) && luma < 92;
      if (isSkin) {
        pixels[index] = 134;
        pixels[index + 1] = 243;
        pixels[index + 2] = 255;
        pixels[index + 3] = 180;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
        sumX += x;
        sumY += y;
        count += 1;
      } else {
        pixels[index + 3] = 0;
      }
    }
  }
  vctx.putImageData(frame, 0, 0);
  vctx.restore();

  if (count < 90) {
    return {
      ...state.gesture,
      name: "未识别",
      confidence: Math.max(0, state.gesture.confidence - 0.08),
      gun: 0,
      palm: 0,
      maskCount: count,
    };
  }

  const cx = sumX / count;
  const cy = sumY / count;
  const width = Math.max(1, maxX - minX);
  const height = Math.max(1, maxY - minY);
  let tip = { x: cx, y: cy };
  let far = 0;
  let radiusSum = 0;

  for (let y = minY; y <= maxY; y += 2) {
    for (let x = minX; x <= maxX; x += 2) {
      const index = (y * SAMPLE_W + x) * 4 + 3;
      if (pixels[index] > 0) {
        const dist = Math.hypot(x - cx, y - cy);
        radiusSum += dist;
        if (dist > far) {
          far = dist;
          tip = { x, y };
        }
      }
    }
  }

  const meanRadius = radiusSum / Math.max(1, count / 4);
  const fill = count / (width * height);
  const longAxis = Math.max(width, height);
  const shortAxis = Math.max(1, Math.min(width, height));
  const aspect = longAxis / shortAxis;
  const protrusion = far / Math.max(1, meanRadius);
  const gun = clamp((aspect - 1.15) * 0.42 + (protrusion - 1.55) * 0.5 + (0.58 - fill) * 0.9, 0, 1);
  const palm = clamp((fill - 0.28) * 2.2 + (1.5 - aspect) * 0.36 + (count - 560) / 900, 0, 1);
  const screenCenter = {
    x: (1 - cx / SAMPLE_W) * GAME_W,
    y: (cy / SAMPLE_H) * GAME_H,
  };
  const rawDir = {
    x: -(tip.x - cx),
    y: tip.y - cy,
  };
  const dirLen = Math.hypot(rawDir.x, rawDir.y) || 1;
  const direction = {
    x: rawDir.x / dirLen,
    y: rawDir.y / dirLen,
  };
  const screenTip = {
    x: screenCenter.x + direction.x * 150,
    y: screenCenter.y + direction.y * 150,
  };
  const dominant = gun > palm ? gun : palm;
  return {
    name: gun > 0.58 ? "手枪射击" : palm > 0.56 ? "开掌交互" : "手部追踪",
    confidence: dominant,
    center: screenCenter,
    tip: screenTip,
    direction,
    gun,
    palm,
    maskCount: count,
  };
}

function blendGesture(next) {
  const prev = state.gesture;
  if (!next.center || !prev.center) {
    state.gesture = next;
    return;
  }
  const blend = 0.36;
  state.gesture = {
    ...next,
    center: {
      x: lerp(prev.center.x, next.center.x, blend),
      y: lerp(prev.center.y, next.center.y, blend),
    },
    tip: {
      x: lerp(prev.tip?.x ?? next.tip.x, next.tip.x, blend),
      y: lerp(prev.tip?.y ?? next.tip.y, next.tip.y, blend),
    },
    direction: {
      x: lerp(prev.direction.x, next.direction.x, blend),
      y: lerp(prev.direction.y, next.direction.y, blend),
    },
    confidence: lerp(prev.confidence, next.confidence, 0.42),
    gun: lerp(prev.gun, next.gun, 0.42),
    palm: lerp(prev.palm, next.palm, 0.42),
  };
}

function shoot(now) {
  const gesture = state.gesture;
  if (!gesture.center || gesture.gun < 0.62 || now - lastShotAt < 330) return;
  lastShotAt = now;
  const origin = gesture.center;
  const dir = normalize(gesture.direction);
  const end = {
    x: origin.x + dir.x * 1400,
    y: origin.y + dir.y * 1400,
  };
  state.beams.push({ origin, end, life: 0.14, maxLife: 0.14 });

  let hit = null;
  let hitDist = Infinity;
  for (const enemy of state.enemies) {
    const dist = distanceToRay(enemy, origin, dir);
    const along = (enemy.x - origin.x) * dir.x + (enemy.y - origin.y) * dir.y;
    if (along > 0 && dist < enemy.r + 12 && along < hitDist) {
      hit = enemy;
      hitDist = along;
    }
  }
  if (hit) {
    hit.hp -= 1;
    state.shake = 8;
    burst(hit.x, hit.y, hit.hue, 18);
    if (hit.hp <= 0) {
      state.score += 120;
      state.enemies.splice(state.enemies.indexOf(hit), 1);
      spawnEnemy();
      if (state.score % 720 === 0) {
        state.wave += 1;
        spawnEnemy();
      }
    } else {
      state.score += 25;
    }
  }
}

function updateGame(dt, now) {
  if (gameOver) return;
  blendGesture(detectGesture());
  shoot(now);
  const gesture = state.gesture;

  for (const enemy of state.enemies) {
    const dx = GAME_W / 2 - enemy.x;
    const dy = GAME_H / 2 - enemy.y;
    const len = Math.hypot(dx, dy) || 1;
    enemy.wobble += dt * 3;
    enemy.x += (dx / len) * enemy.speed * dt + Math.cos(enemy.wobble) * 14 * dt;
    enemy.y += (dy / len) * enemy.speed * dt + Math.sin(enemy.wobble) * 14 * dt;
    if (Math.hypot(enemy.x - GAME_W / 2, enemy.y - GAME_H / 2) < 76) {
      state.shield -= 12;
      state.shake = 14;
      burst(enemy.x, enemy.y, "#ff5d73", 24);
      state.enemies.splice(state.enemies.indexOf(enemy), 1);
      spawnEnemy();
      break;
    }
  }

  for (const core of state.cores) {
    const touching = gesture.center && Math.hypot(gesture.center.x - core.x, gesture.center.y - core.y) < core.r + 72;
    if (touching && gesture.palm > 0.56) {
      core.charge = clamp(core.charge + dt * 0.25, 0, 1);
      state.progress = Math.max(state.progress, (state.cores.reduce((sum, item) => sum + item.charge, 0) / state.cores.length) * 100);
      if (Math.random() < 0.3) burst(core.x, core.y, "#86f3ff", 1);
    } else {
      core.charge = Math.max(0, core.charge - dt * 0.035);
    }
  }

  for (const beam of state.beams) beam.life -= dt;
  state.beams = state.beams.filter((beam) => beam.life > 0);

  for (const particle of state.particles) {
    particle.life -= dt;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vx *= 0.98;
    particle.vy *= 0.98;
  }
  state.particles = state.particles.filter((particle) => particle.life > 0);
  state.shake = Math.max(0, state.shake - dt * 28);

  if (state.shield <= 0 || state.progress >= 100) {
    gameOver = true;
  }
  updateHud();
}

function draw() {
  const sx = (Math.random() - 0.5) * state.shake;
  const sy = (Math.random() - 0.5) * state.shake;
  ctx.save();
  ctx.clearRect(0, 0, GAME_W, GAME_H);
  ctx.translate(sx, sy);
  drawArena();
  drawCores();
  drawEnemies();
  drawBeams();
  drawParticles();
  drawGestureCursor();
  if (gameOver) drawEndState();
  ctx.restore();
}

function drawArena() {
  const gradient = ctx.createLinearGradient(0, 0, GAME_W, GAME_H);
  gradient.addColorStop(0, "#071014");
  gradient.addColorStop(0.5, "#11191b");
  gradient.addColorStop(1, "#150d12");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, GAME_W, GAME_H);

  ctx.strokeStyle = "rgba(134, 243, 255, 0.07)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= GAME_W; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, GAME_H);
    ctx.stroke();
  }
  for (let y = 0; y <= GAME_H; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(GAME_W, y);
    ctx.stroke();
  }

  ctx.save();
  ctx.translate(GAME_W / 2, GAME_H / 2);
  const pulse = 1 + Math.sin(performance.now() / 360) * 0.04;
  ctx.fillStyle = "rgba(134, 243, 255, 0.08)";
  ctx.beginPath();
  ctx.arc(0, 0, 86 * pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(134, 243, 255, 0.32)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 62, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#f4f7fb";
  ctx.font = "700 16px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("NEXUS", 0, 6);
  ctx.restore();
}

function drawCores() {
  for (const core of state.cores) {
    ctx.save();
    ctx.translate(core.x, core.y);
    ctx.strokeStyle = "rgba(134, 243, 255, 0.25)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, core.r + 24, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * core.charge);
    ctx.stroke();
    ctx.fillStyle = "rgba(134, 243, 255, 0.12)";
    ctx.beginPath();
    ctx.arc(0, 0, core.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(134, 243, 255, 0.72)";
    ctx.stroke();
    ctx.fillStyle = "#86f3ff";
    ctx.font = "900 22px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(core.label, 0, 8);
    ctx.restore();
  }
}

function drawEnemies() {
  for (const enemy of state.enemies) {
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    ctx.rotate(enemy.wobble * 0.2);
    ctx.fillStyle = enemy.hue;
    ctx.shadowBlur = 22;
    ctx.shadowColor = enemy.hue;
    polygon(enemy.r, 6);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
    ctx.lineWidth = 2;
    polygon(enemy.r + 5, 6);
    ctx.stroke();
    ctx.fillStyle = "#071014";
    ctx.beginPath();
    ctx.arc(0, 0, enemy.r * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawBeams() {
  for (const beam of state.beams) {
    const alpha = beam.life / beam.maxLife;
    ctx.strokeStyle = `rgba(134, 243, 255, ${alpha})`;
    ctx.lineWidth = 8 * alpha + 2;
    ctx.beginPath();
    ctx.moveTo(beam.origin.x, beam.origin.y);
    ctx.lineTo(beam.end.x, beam.end.y);
    ctx.stroke();
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function drawParticles() {
  for (const particle of state.particles) {
    const alpha = clamp(particle.life / particle.maxLife, 0, 1);
    ctx.fillStyle = particle.color.replace(")", `, ${alpha})`).replace("rgb", "rgba");
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawGestureCursor() {
  const gesture = state.gesture;
  if (!gesture.center) return;
  const { center, tip } = gesture;
  ctx.save();
  ctx.strokeStyle = gesture.gun > gesture.palm ? "#ffd166" : "#86f3ff";
  ctx.fillStyle = gesture.gun > gesture.palm ? "rgba(255, 209, 102, 0.18)" : "rgba(134, 243, 255, 0.16)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(center.x, center.y, 26 + gesture.confidence * 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  if (tip) {
    ctx.beginPath();
    ctx.moveTo(center.x, center.y);
    ctx.lineTo(tip.x, tip.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, 8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawEndState() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.58)";
  ctx.fillRect(0, 0, GAME_W, GAME_H);
  ctx.fillStyle = "#f4f7fb";
  ctx.textAlign = "center";
  ctx.font = "900 70px Inter, sans-serif";
  ctx.fillText(state.progress >= 100 ? "任务完成" : "核心失守", GAME_W / 2, GAME_H / 2 - 28);
  ctx.font = "700 22px Inter, sans-serif";
  ctx.fillText(`最终分数 ${state.score}`, GAME_W / 2, GAME_H / 2 + 28);
}

function updateHud() {
  scoreEl.textContent = String(state.score);
  shieldEl.textContent = String(Math.max(0, Math.ceil(state.shield)));
  progressEl.textContent = `${Math.floor(clamp(state.progress, 0, 100))}%`;
  gestureEl.textContent = state.gesture.name;
  meterEl.style.width = `${Math.floor(clamp(state.gesture.confidence, 0, 1) * 100)}%`;
}

function burst(x, y, color, amount) {
  for (let i = 0; i < amount; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 60 + Math.random() * 260;
    state.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color,
      size: 2 + Math.random() * 5,
      life: 0.35 + Math.random() * 0.45,
      maxLife: 0.8,
    });
  }
}

function polygon(radius, sides) {
  ctx.beginPath();
  for (let i = 0; i < sides; i += 1) {
    const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function distanceToRay(point, origin, dir) {
  const px = point.x - origin.x;
  const py = point.y - origin.y;
  const projection = px * dir.x + py * dir.y;
  const closest = {
    x: origin.x + dir.x * projection,
    y: origin.y + dir.y * projection,
  };
  return Math.hypot(point.x - closest.x, point.y - closest.y);
}

function normalize(vector) {
  const length = Math.hypot(vector.x, vector.y) || 1;
  return { x: vector.x / length, y: vector.y / length };
}

function lerp(a, b, amount) {
  return a + (b - a) * amount;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function loop(now) {
  const dt = Math.min(0.04, (now - lastTime) / 1000);
  lastTime = now;
  updateGame(dt, now);
  draw();
  requestAnimationFrame(loop);
}

startCameraBtn.addEventListener("click", startCamera);
briefStartBtn.addEventListener("click", () => {
  briefing.classList.add("hidden");
  startCamera();
});
calibrateBtn.addEventListener("click", calibrateHand);
restartBtn.addEventListener("click", () => {
  briefing.classList.add("hidden");
  resetGame();
});
canvas.addEventListener("pointermove", (event) => {
  const rect = canvas.getBoundingClientRect();
  pointerFallback = {
    active: true,
    x: ((event.clientX - rect.left) / rect.width) * GAME_W,
    y: ((event.clientY - rect.top) / rect.height) * GAME_H,
  };
});
canvas.addEventListener("pointerleave", () => {
  pointerFallback.active = false;
});
window.addEventListener("resize", resizeCanvas);

resizeCanvas();
resetGame();
requestAnimationFrame(loop);
