const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const uiScore = document.getElementById('ui');
const uiLives = document.getElementById('lives');

canvas.width = 400; // WIDTH = 400 จาก Python
canvas.height = 600; // HEIGHT = 600 จาก Python

// สี (RGB แปลงเป็น HEX)
const WHITE = '#FFFFFF';
const RED = '#FF3232'; // Red (255, 50, 50)
const PURPLE = '#8A2BE2'; // Purple (138, 43, 226)
const DARK_PURPLE = '#231d3f'; // สีพื้นหลัง

let score = 0;
let lives = 3;
let isGameOver = false;

// รูปทรงผู้เล่น (เป็นสามเหลี่ยมง่ายๆ)
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 70,
    width: 50,
    height: 50,
    speed: 5
};

const bullets = [];
const enemies = [];
const particles = []; // สำหรับเอฟเฟกต์การทำลาย

// จัดการการควบคุม
const keys = {};
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);
document.addEventListener('keydown', e => {
    if (e.key === ' ' && !isGameOver) {
        bullets.push({ x: player.x + player.width / 2, y: player.y, speed: 7 });
    }
});

// ฟังก์ชันสร้างอนุภาคสำหรับการทำลาย
function createParticles(x, y, color) {
    for (let i = 0; i < 15; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
            life: Math.random() * 30 + 20,
            color: color
        });
    }
}

// อัปเดตตรรกะของเกม
function update() {
    if (isGameOver) return;

    // การเคลื่อนที่ของผู้เล่น
    if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) player.x += player.speed;

    // เคลื่อนที่กระสุน
    bullets.forEach((bullet, index) => {
        bullet.y -= bullet.speed;
        if (bullet.y < 0) bullets.splice(index, 1);
    });

    // สร้างศัตรู
    if (Math.random() < 0.05) { // ปรับความเร็วในการสร้างศัตรูได้ที่นี่
        const isPurple = Math.random() < 0.3; // 30% เป็นศัตรูสีม่วง
        enemies.push({
            x: Math.random() * (canvas.width - 40),
            y: -40,
            width: 40,
            height: 40,
            speed: isPurple ? 3 : 2, // สีม่วงเร็วขึ้น
            color: isPurple ? PURPLE : RED,
            scoreValue: isPurple ? 50 : 10,
            particlesColor: isPurple ? WHITE : PURPLE // อนุภาคหลังทำลาย
        });
    }

    // เคลื่อนที่ศัตรูและตรวจสอบการชน
    enemies.forEach((enemy, eIndex) => {
        enemy.y += enemy.speed;

        // การชนระหว่างศัตรูกับผู้เล่น
        if (player.x < enemy.x + enemy.width && player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height && player.y + player.height > enemy.y) {
            enemies.splice(eIndex, 1);
            lives--;
            updateUI();
            createParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.particlesColor);
            if (lives <= 0) isGameOver = true;
        }

        // การชนระหว่างกระสุนกับศัตรู
        bullets.forEach((bullet, bIndex) => {
            if (bullet.x < enemy.x + enemy.width && bullet.x + 1 > enemy.x && // กระสุนเป็นจุดหรือเส้น
                bullet.y < enemy.y + enemy.height && bullet.y + 1 > enemy.y) {
                
                score += enemy.scoreValue;
                updateUI();
                createParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.particlesColor);
                enemies.splice(eIndex, 1);
                bullets.splice(bIndex, 1);
            }
        });

        // ลบศัตรูที่หลุดหน้าจอ
        if (enemy.y > canvas.height) enemies.splice(eIndex, 1);
    });

    // อัปเดตอนุภาค
    particles.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.life <= 0) particles.splice(index, 1);
    });
}

// อัปเดต UI (Score และ Lives)
function updateUI() {
    uiScore.textContent = `SCORE: ${score}`;
    let lifeStr = 'LIVES: ';
    for (let i = 0; i < lives; i++) lifeStr += '💜';
    uiLives.textContent = lifeStr;
}

// วาดองค์ประกอบของเกม
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // วาดผู้เล่น (สามเหลี่ยมง่ายๆ ตามรูปในวิดีโอ)
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y);
    ctx.lineTo(player.x, player.y + player.height);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.closePath();
    ctx.fillStyle = WHITE;
    ctx.fill();

    // วาดกระสุน
    ctx.fillStyle = WHITE;
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x - 2, bullet.y - 10, 4, 10); // วาดเป็นเส้นสั้นๆ
    });

    // วาดศัตรู (สามเหลี่ยมหงาย)
    enemies.forEach(enemy => {
        ctx.beginPath();
        ctx.moveTo(enemy.x + enemy.width / 2, enemy.y + enemy.height); // ยอดแหลมชี้ลง
        ctx.lineTo(enemy.x, enemy.y);
        ctx.lineTo(enemy.x + enemy.width, enemy.y);
        ctx.closePath();
        ctx.fillStyle = enemy.color;
        ctx.fill();
    });

    // วาดอนุภาค
    particles.forEach(p => {
        ctx.globalAlpha = p.life / 50; // ค่อยๆ จางลง
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 3, 3);
        ctx.globalAlpha = 1;
    });

    if (isGameOver) {
        ctx.fillStyle = WHITE;
        ctx.font = '40px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
    }
}

// วนลูปเกม
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// เริ่มเกม
gameLoop();