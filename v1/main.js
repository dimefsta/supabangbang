/*
Sound Credits:
SFX Laser Shoot 02 by bolkmar
https://freesound.org/people/bolkmar/sounds/421704/
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

// === Canvas setup ===
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// === Player setup ===
const player = {
  x: canvas.width / 2 - 30,
  y: canvas.height - 50,
  width: 60,
  height: 18,
  speed: 6,
  dx: 0,
};

// === Game State ===
let score = 0;
let lives = 3;
let gameOver = false;
let playerSafe = false;

// === Sound Effects ===
const popSound = new Audio("sounds/pop.wav");
const shootSound = new Audio("sounds/shoot.wav");
popSound.volume = 0.5;
shootSound.volume = 0.4;

// === Balls setup ===
let balls = [
  {
    x: canvas.width / 2,
    y: 100,
    radius: 30,
    dx: 3,
    dy: 3,
  },
];

// === Harpoon setup ===
const harpoon = {
  x: 0,
  y: 0,
  width: 4,
  height: 0,
  speed: 10,
  active: false,
};

// === Input handling ===
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && gameOver) restartGame();
});

function keyDown(e) {
  if (e.key === "ArrowRight") player.dx = player.speed;
  else if (e.key === "ArrowLeft") player.dx = -player.speed;
  else if (e.key === " ") shootHarpoon(); // Space to shoot
}

function keyUp(e) {
  if (e.key === "ArrowRight" || e.key === "ArrowLeft") player.dx = 0;
}

// === Player movement ===
function movePlayer() {
  player.x += player.dx;
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width)
    player.x = canvas.width - player.width;
}

// === Ball movement & physics ===
function moveBalls() {
  balls.forEach((ball) => {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall bounce
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width)
      ball.dx *= -1;

    // Ceiling bounce
    if (ball.y - ball.radius < 0) ball.dy *= -1;

    // Floor bounce
    if (ball.y + ball.radius > canvas.height) {
      ball.dy *= -1;
      ball.y = canvas.height - ball.radius;
    }

    // Gravity effect
    ball.dy += 0.1;

    // Collision with player → lose life
    if (
      !playerSafe &&
      ball.y + ball.radius >= player.y &&
      ball.x + ball.radius > player.x &&
      ball.x - ball.radius < player.x + player.width &&
      ball.dy > 0
    ) {
      loseLife();
    }
  });
}

// === Lose Life ===
function loseLife() {
  lives--;
  if (lives <= 0) {
    gameOver = true;
  } else {
    // Reset player position only, keep balls
    player.x = canvas.width / 2 - player.width / 2;

    // Temporary invincibility (1s)
    playerSafe = true;
    setTimeout(() => (playerSafe = false), 1000);
  }
}

// === Harpoon logic ===
function shootHarpoon() {
  if (!harpoon.active) {
    harpoon.active = true;
    harpoon.x = player.x + player.width / 2 - harpoon.width / 2;
    harpoon.y = player.y;
    harpoon.height = 0;
    shootSound.currentTime = 0;
    shootSound.play().catch(() => {});
  }
}

function updateHarpoon() {
  if (harpoon.active) {
    harpoon.height += harpoon.speed;
    if (harpoon.y - harpoon.height <= 0) {
      harpoon.active = false;
      harpoon.height = 0;
    }
  }
}

// === Harpoon vs Balls collision ===
function checkHarpoonCollision() {
  if (!harpoon.active) return;

  const tipY = harpoon.y - harpoon.height;

  balls.forEach((ball, index) => {
    if (
      harpoon.x > ball.x - ball.radius &&
      harpoon.x < ball.x + ball.radius &&
      tipY < ball.y + ball.radius &&
      tipY > ball.y - ball.radius
    ) {
      harpoon.active = false;
      harpoon.height = 0;
      popSound.currentTime = 0;
      popSound.play().catch(() => {});

      score += Math.round(100 / ball.radius * 10);

      if (ball.radius > 15) {
        const newRadius = ball.radius / 1.5;
        balls.push({
          x: ball.x - newRadius,
          y: ball.y,
          radius: newRadius,
          dx: -Math.abs(ball.dx),
          dy: -Math.abs(ball.dy),
        });
        balls.push({
          x: ball.x + newRadius,
          y: ball.y,
          radius: newRadius,
          dx: Math.abs(ball.dx),
          dy: -Math.abs(ball.dy),
        });
      }

      balls.splice(index, 1);
    }
  });
}

// === Drawing ===
function drawPlayer() {
  let color = getComputedStyle(document.documentElement)
    .getPropertyValue("--player-color");

  ctx.fillStyle = color;
  if (playerSafe) ctx.globalAlpha = 0.5;
  ctx.fillRect(player.x, player.y, player.width, player.height);
  ctx.globalAlpha = 1;
}

function drawBalls() {
  const ballColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--ball-color");
  balls.forEach((ball) => {
    ctx.fillStyle = ballColor;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  });
}

function drawHarpoon() {
  if (harpoon.active) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(
      harpoon.x,
      harpoon.y - harpoon.height,
      harpoon.width,
      harpoon.height
    );
  }
}

function drawScore() {
  ctx.fillStyle = getComputedStyle(document.documentElement)
    .getPropertyValue("--text-color");
  ctx.font = "20px 'Courier New'";
  ctx.fillText(`Score: ${score}`, 20, 30);
}

function drawLives() {
  ctx.fillStyle = getComputedStyle(document.documentElement)
    .getPropertyValue("--text-color");
  ctx.font = "20px 'Courier New'";
  ctx.fillText(`Lives: ${lives}`, canvas.width - 120, 30);
}

function drawGameOver() {
  ctx.fillStyle = "#fff";
  ctx.font = "40px 'Courier New'";
  ctx.fillText("GAME OVER", canvas.width / 2 - 130, canvas.height / 2);
  ctx.font = "20px 'Courier New'";
  ctx.fillText("Press Enter to Restart", canvas.width / 2 - 120, canvas.height / 2 + 40);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlayer();
  drawBalls();
  drawHarpoon();
  drawScore();
  drawLives();
}

// === Restart Game ===
function restartGame() {
  gameOver = false;
  lives = 3;
  score = 0;
  balls = [
    {
      x: canvas.width / 2,
      y: 100,
      radius: 30,
      dx: 3,
      dy: 3,
    },
  ];
  player.x = canvas.width / 2 - player.width / 2;
  update();
}

// === Main game loop ===
function update() {
  if (gameOver) {
    drawGameOver();
    return;
  }

  movePlayer();
  moveBalls();
  updateHarpoon();
  checkHarpoonCollision();
  draw();
  requestAnimationFrame(update);
}

// === Start game ===
update();
