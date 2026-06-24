const canvas = document.getElementById("weather-canvas");
const ctx = canvas.getContext("2d");

canvas.width = Math.min(window.innerWidth, 1200);
canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
    canvas.width = Math.min(window.innerWidth, 1200);
    canvas.height = window.innerHeight;
});

let particles = [];
let animationId = null;
let lightningInterval = null;
let currentWeather = null;
let globalTime = 0; // Driven tracker for floating sinusoids

const random = (min, max) => Math.random() * (max - min) + min;

class RainParticle {
    constructor() { this.reset(); this.y = random(0, canvas.height); }
    reset() { this.x = random(0, canvas.width); this.y = -20; this.len = random(10, 25); this.speed = random(4, 10); }
    update() { this.y += this.speed; if (this.y > canvas.height) this.reset(); }
    draw() {
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(this.x, this.y); ctx.lineTo(this.x, this.y + this.len); ctx.stroke();
    }
}

class SnowParticle {
    constructor() { this.reset(); this.y = random(0, canvas.height); }
    reset() { this.x = random(0, canvas.width); this.y = -10; this.r = random(1, 4); this.speed = random(0.5, 2); this.drift = random(-0.5, 0.5); }
    update() { this.y += this.speed; this.x += this.drift; if (this.y > canvas.height) this.reset(); }
    draw() {
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2); ctx.fill();
    }
}

class CloudParticle {
    constructor() { this.reset(); this.x = random(0, canvas.width); }
    reset() { this.x = -150; this.y = random(30, canvas.height * 0.4); this.r = random(40, 80); this.speed = random(0.1, 0.4); }
    update() { this.x += this.speed; if (this.x > canvas.width + 100) this.reset(); }
    draw() {
        ctx.fillStyle = document.body.classList.contains("light") ? "rgba(0, 0, 0, 0.03)" : "rgba(255, 255, 255, 0.03)";
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(this.x + this.r * 0.5, this.y - this.r * 0.2, this.r * 0.8, 0, Math.PI * 2); ctx.fill();
    }
}

class MistParticle {
    constructor() { this.reset(); this.y = random(0, canvas.height); }
    reset() { this.x = random(0, canvas.width); this.y = random(canvas.height * 0.3, canvas.height); this.r = random(30, 60); this.speed = random(0.2, 0.6); }
    update() { this.x += this.speed; if (this.x > canvas.width + 50) { this.x = -50; this.y = random(canvas.height * 0.3, canvas.height); } }
    draw() {
        ctx.fillStyle = document.body.classList.contains("light") ? "rgba(0,0,0,0.02)" : "rgba(255,255,255,0.02)";
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2); ctx.fill();
    }
}

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    globalTime += 0.01;

    // Direct background ambient updates for Clear/Sunny states
    if (currentWeather && (currentWeather.includes("clear") || currentWeather.includes("sun"))) {
        let pulse = Math.sin(globalTime) * 15;
        let glowGrad = ctx.createRadialGradient(canvas.width * 0.8, 100, 10, canvas.width * 0.8, 100, 100 + pulse);
        glowGrad.addColorStop(0, document.body.classList.contains("light") ? "rgba(253, 224, 71, 0.15)" : "rgba(253, 224, 71, 0.05)");
        glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = glowGrad;
        ctx.beginPath(); ctx.arc(canvas.width * 0.8, 100, 200 + pulse, 0, Math.PI * 2); ctx.fill();
    }

    particles.forEach(p => { p.update(); p.draw(); });
    animationId = requestAnimationFrame(loop);
}

function stopEngine() {
    if (animationId) { cancelAnimationFrame(animationId); animationId = null; }
    if (lightningInterval) { clearInterval(lightningInterval); lightningInterval = null; }
    particles = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.style.filter = "none";
}

function lightning() {
    if (Math.random() > 0.7) {
        canvas.style.filter = "brightness(1.8)";
        setTimeout(() => { canvas.style.filter = "none"; }, 120);
    }
}

function setWeather(type) {
    stopEngine();
    if (!type) return;
    currentWeather = type.toLowerCase();
    
    if (currentWeather.includes("rain") || currentWeather.includes("drizzle")) {
        particles = Array.from({ length: 60 }, () => new RainParticle());
        loop();
    } else if (currentWeather.includes("snow")) {
        particles = Array.from({ length: 50 }, () => new SnowParticle());
        loop();
    } else if (currentWeather.includes("thunder") || currentWeather.includes("storm")) {
        particles = Array.from({ length: 70 }, () => new RainParticle());
        loop();
        lightningInterval = setInterval(lightning, 2500);
    } else if (currentWeather.includes("cloud")) {
        particles = Array.from({ length: 6 }, () => new CloudParticle());
        loop();
    } else if (currentWeather.includes("mist") || currentWeather.includes("fog") || currentWeather.includes("haze")) {
        particles = Array.from({ length: 12 }, () => new MistParticle());
        loop();
    } else {
        // Fallback structural initialization for unhandled cases (e.g., Squall, Dust)
        particles = Array.from({ length: 4 }, () => new CloudParticle());
        loop();
    }
}

console.log("Weather Canvas Particle Engine Connected");