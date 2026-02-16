const canvas = document.getElementById('parallax-canvas');
const ctx = canvas.getContext('2d');

let width, height;
const fontSize = 16;
const elements = [];
const explosions = [];
const elementCount = 30; // Reduced from 60 to prevent too many explosions

const snippets = [
    'const app = express();', 'function init() {', 'return await db.query();',
    'export default Component;', 'margin: 0 auto;', 'display: flex;',
    'grid-template-columns: 1fr;', 'color: var(--accent);', 'JSON', 'API',
    'if (user.isAdmin)', 'console.log("Zagula");', 'GIT', '#bug',
    'window.addEventListener', 'ctx.fillText', 'border-radius: 50%;', 'padding: 20px;'
];

const colors = ['#61afef', '#c678dd', '#98c379', '#e06c75', '#d19a66', '#56b6c2'];

class CodeElement {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        // Random direction: most go down, some go up/sideways
        const angle = Math.random() < 0.7 ? Math.PI / 2 + (Math.random() - 0.5) * 0.5 : Math.random() * Math.PI * 2;
        const speed = Math.random() * 1.5 + 0.5;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.textIdx = Math.floor(Math.random() * snippets.length);
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.width = ctx.measureText(snippets[this.textIdx]).width;
        this.height = fontSize;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < -100 || this.x > width + 100 || this.y < -50 || this.y > height + 50) {
            this.reset();
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.5;
        ctx.fillText(snippets[this.textIdx], this.x, this.y);
        ctx.globalAlpha = 1.0;
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.life = 1.0;
        this.decay = Math.random() * 0.05 + 0.02;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.life;
        ctx.fillRect(this.x, this.y, 2, 2);
        ctx.globalAlpha = 1.0;
    }
}

function init() {
    resize();
    for (let i = 0; i < elementCount; i++) {
        elements.push(new CodeElement());
    }
    animate();
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    ctx.font = `${fontSize}px monospace`;
}

function createExplosion(x, y, color) {
    for (let i = 0; i < 15; i++) {
        explosions.push(new Particle(x, y, color));
    }
}

function checkCollisions() {
    for (let i = 0; i < elements.length; i++) {
        for (let j = i + 1; j < elements.length; j++) {
            const e1 = elements[i];
            const e2 = elements[j];
            const dx = e1.x - e2.x;
            const dy = e1.y - e2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 30) {
                createExplosion((e1.x + e2.x) / 2, (e1.y + e2.y) / 2, e1.color);
                e1.reset();
                e2.reset();
            }
        }
    }
}

function animate() {
    // Increased opacity for background fill to decrease trails (0.2 instead of 0.1)
    ctx.fillStyle = 'rgba(5, 5, 5, 0.25)';
    ctx.fillRect(0, 0, width, height);

    ctx.font = `${fontSize}px monospace`;

    elements.forEach(el => {
        el.update();
        el.draw();
    });

    checkCollisions();

    for (let i = explosions.length - 1; i >= 0; i--) {
        const p = explosions[i];
        p.update();
        p.draw();
        if (p.life <= 0) explosions.splice(i, 1);
    }

    requestAnimationFrame(animate);
}

window.addEventListener('resize', resize);
// Magnetic glow and subtle pulse effect for the main card
const card = document.getElementById('main-card');
window.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element.
    const y = e.clientY - rect.top;  // y position within the element.

    // Calculate distance from center for subtle translation
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const moveX = (e.clientX - window.innerWidth / 2) / 50;
    const moveY = (e.clientY - window.innerHeight / 2) / 50;

    // Apply the magnetic effect: subtle move + custom property for CSS glow
    card.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.01)`;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
});

// Reset effect when mouse leaves
window.addEventListener('mouseleave', () => {
    card.style.transform = `translate(0, 0) scale(1)`;
});

init();
