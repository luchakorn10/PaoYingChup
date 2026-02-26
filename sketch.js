// --- 🔗 ใส่ Link Model ของคุณตรงนี้ ---
let imageModelURL = 'https://teachablemachine.withgoogle.com/models/GaLbGQ7aJ/';

let video;
let flipVideo;
let label = "Loading...";
let classifier;

// ตัวแปรเกม
let playerMove = "";
let comMove = "";
let result = "";
let playerScore = 0;
let comScore = 0;
let winningScore = 4; // 🏆 จบเกมที่ 4 คะแนน

// ตัวแปรเวลา
let timer = 3;
let gameState = "start"; // start, countdown, result, gameover

// เอฟเฟกต์
let particles = []; // เก็บเม็ดพลุ
let shakeAmount = 0; // แรงสั่นหน้าจอ

// รูปภาพไอคอน
let icons = {
    "Rock": "✊",
    "Paper": "🖐️",
    "Scissor": "✌️",
    "None": "..."
};

function preload() {
    classifier = ml5.imageClassifier(imageModelURL + 'model.json');
}

function setup() {
    createCanvas(640, 480);

    video = createCapture(VIDEO);
    video.size(640, 480);
    video.hide();

    flipVideo = ml5.flipImage(video);
    classifyVideo();

    textSize(32);
    textAlign(CENTER, CENTER);
}

function classifyVideo() {
    flipVideo = ml5.flipImage(video);
    classifier.classify(flipVideo, gotResult);
}

function gotResult(error, results) {
    if (error) {
        console.error(error);
        return;
    }
    label = results[0].label;
    classifyVideo();
}

function draw() {
    background(50);

    // ระบบสั่นหน้าจอ (Screen Shake) เวลาแพ้
    if (shakeAmount > 0) {
        translate(random(-shakeAmount, shakeAmount), random(-shakeAmount, shakeAmount));
        shakeAmount -= 1;
    }

    // วาดวิดีโอ
    image(flipVideo, 0, 0);

    // --- Logic ของเกมในแต่ละสถานะ ---

    if (gameState === "start") {
        drawOverlay(0, 150);
        fill(255);
        textSize(50);
        text("เป่ายิ้งฉุบ กู้โลก!", width / 2, height / 2 - 40);
        textSize(25);
        text("ใครถึง 4 คะแนนก่อนชนะ", width / 2, height / 2 + 10);
        fill(255, 255, 0);
        text("กด [SPACEBAR] เพื่อเริ่ม", width / 2, height / 2 + 60);

    } else if (gameState === "countdown") {
        // นับถอยหลัง 3.. 2.. 1..
        fill(255, 255, 0);
        stroke(0);
        strokeWeight(4);
        textSize(150);
        text(timer, width / 2, height / 2);

        if (frameCount % 60 == 0 && timer > 0) {
            timer--;
        }
        if (timer == 0) {
            decideWinner();
        }

    } else if (gameState === "result") {
        drawResultScreen();
    } else if (gameState === "gameover") {
        drawGameOverScreen(); // 🏆 หน้าจอจบเกม
    }

    // โชว์คะแนนตลอดเวลา (Scoreboard)
    drawScoreboard();
}

// ฟังก์ชันตัดสินผลแพ้ชนะ
function decideWinner() {
    playerMove = label;

    // --- 🤖 AI ระดับกลาง (Medium) ---
    let difficulty = 30; // 30% คือแอบโกง / 70% คือสุ่ม (กำลังดี ไม่ยากไป)
    let dice = random(100);

    if (dice < difficulty && playerMove !== "None") {
        // โหมดแก้ทาง (Counter Move)
        if (playerMove === "Rock") comMove = "Paper";
        else if (playerMove === "Paper") comMove = "Scissor";
        else if (playerMove === "Scissor") comMove = "Rock";
    } else {
        // โหมดสุ่ม (Random)
        let moves = ["Rock", "Paper", "Scissor"];
        comMove = random(moves);
    }
    // --------------------------------

    // ตัดสินผล
    if (playerMove === "None") {
        result = "MISS";
        shakeAmount = 10;
    } else if (playerMove === comMove) {
        result = "DRAW";
    } else if (
        (playerMove === "Rock" && comMove === "Scissor") ||
        (playerMove === "Paper" && comMove === "Rock") ||
        (playerMove === "Scissor" && comMove === "Paper")
    ) {
        result = "WIN";
        playerScore++;
        createParticles();
    } else {
        result = "LOSE";
        comScore++;
        shakeAmount = 20;
    }

    // เช็คว่าจบเกมหรือยัง (ใครถึง 4 ก่อน)
    if (playerScore >= winningScore || comScore >= winningScore) {
        gameState = "gameover"; // ไปหน้าจบเกม
    } else {
        gameState = "result"; // ไปหน้ารายงานผลรอบปกติ
    }
}

// หน้าจอแสดงผลรายรอบ
function drawResultScreen() {
    if (result === "WIN") {
        drawOverlay(0, 255, 0, 100);
        updateParticles();
    } else if (result === "LOSE") {
        drawOverlay(255, 0, 0, 100);
    } else {
        drawOverlay(255, 255, 0, 100);
    }

    textSize(100);
    text(icons[playerMove], width / 4, height / 2);
    text(icons[comMove], width * 3 / 4, height / 2);

    textSize(30);
    fill(255);
    noStroke();
    text("YOU", width / 4, height / 2 - 80);
    text("AI", width * 3 / 4, height / 2 - 80);

    textSize(80);
    stroke(0);
    strokeWeight(5);
    fill(255);
    text(result, width / 2, height / 2);

    textSize(20);
    noStroke();
    text("Press [SPACE] for next round", width / 2, height - 50);
}

// 🏆 หน้าจอจบเกม (Game Over)
function drawGameOverScreen() {
    drawOverlay(0, 0, 0, 200); // พื้นหลังดำเข้ม

    fill(255);
    textSize(40);
    noStroke();

    if (playerScore >= winningScore) {
        fill(0, 255, 0);
        text("🎉 CONGRATULATIONS! 🎉", width / 2, height / 2 - 50);
        fill(255);
        text("YOU WON THE MATCH!", width / 2, height / 2 + 10);
        updateParticles(); // จุดพลุฉลองแชมป์
    } else {
        fill(255, 0, 0);
        text("💀 GAME OVER 💀", width / 2, height / 2 - 50);
        fill(255);
        text("AI WINS THE MATCH", width / 2, height / 2 + 10);
    }

    textSize(20);
    fill(200);
    text("Press [SPACE] to Restart Game", width / 2, height - 60);
}

// ฟังก์ชันวาดแถบคะแนน
function drawScoreboard() {
    fill(0, 150);
    noStroke();
    rect(0, 0, width, 50);

    fill(255);
    textSize(24);
    textAlign(CENTER, CENTER);
    // โชว์คะแนนแบบ X / 4
    text(`YOU: ${playerScore} / ${winningScore}  |  AI: ${comScore} / ${winningScore}`, width / 2, 25);
}

function drawOverlay(r, g, b, a) {
    push();
    noStroke();
    if (arguments.length === 2) {
        fill(r, g);
    } else {
        fill(r, g, b, a);
    }
    rect(0, 0, width, height);
    pop();
}

function createParticles() {
    for (let i = 0; i < 100; i++) {
        particles.push(new Particle(width / 2, height / 2));
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].show();
        if (particles[i].finished()) {
            particles.splice(i, 1);
        }
    }
}

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = random(-5, 5);
        this.vy = random(-15, -5);
        this.alpha = 255;
        this.color = color(random(255), random(255), random(255));
    }

    finished() {
        return this.alpha < 0;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.5;
        this.alpha -= 5;
    }

    show() {
        noStroke();
        fill(this.color.levels[0], this.color.levels[1], this.color.levels[2], this.alpha);
        ellipse(this.x, this.y, 10);
    }
}

function keyPressed() {
    if (key === ' ') {
        // 1. ถ้าอยู่หน้า Start หรือ Result (ระหว่างรอบ) -> เริ่มนับถอยหลัง
        if (gameState === "start" || gameState === "result") {
            gameState = "countdown";
            timer = 3;
            particles = [];
            shakeAmount = 0;
        }
        // 2. ถ้าอยู่หน้า Game Over (จบแมตช์) -> รีเซ็ตคะแนน เริ่มเกมใหม่
        else if (gameState === "gameover") {
            playerScore = 0;
            comScore = 0;
            gameState = "countdown";
            timer = 3;
            particles = [];
            shakeAmount = 0;
        }
    }
}