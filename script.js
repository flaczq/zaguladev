const canvas = document.getElementById('parallax-canvas');
const ctx = canvas.getContext('2d');

let width, height;
const fontSize = 18;
const elements = [];
const elementCount = 20; // Increased for more floating quotes

const quotes = [
    'NIE MA LIMITÓW', 'DZIAŁAJ TERAZ', 'TWÓJ CZAS JEST TERAZ',
    'NIGDY SIĘ NIE PODDAWAJ', 'SKUP SIĘ NA CELU', 'BĄDŹ NIEUSTRASZONY',
    'DYSCYPLINA TO WOLNOŚĆ', 'ROZWIJAJ SIĘ CODZIENNIE', 'ODWAŻ SIĘ MARZYĆ',
    'SIŁA JEST W TOBIE', 'PRZEKRACZAJ GRANICE', 'BUDUJ SWOJE IMPERIUM',
    'KAŻDY KROK SIĘ LICZY', 'BĄDŹ DUMNY Z PRACY', 'SZUKAJ ROZWIĄZAŃ',
    'CIERPLIWOŚĆ TO SIŁA', 'WSTAŃ I WALCZ', 'TWÓRZ PRZYSZŁOŚĆ',
    'U MNIE DZIAŁA ¯\_(ツ)_/¯', 'KODUJ ALBO GIŃ', 'JESZCZE JEDEN COMMIT...',
    'TO NIE BUG, TO FEATURE', 'KTOŚ TO TESTOWAŁ?', 'GIT PUSH -F I FAJRANT',
    'CO MOŻE PÓJŚĆ NIE TAK?', 'MAMO, JESZCZE JEDNA FUNKCJA'
];

const colors = ['#ffffff', '#00d4ff', '#7000ff', '#aaaaaa', '#dddddd'];

class QuoteElement {
    constructor() {
        this.reset([]);
    }

    reset(rects = []) {
        let attempts = 0;
        let validPos = false;

        // Pick individual scale for each quote for depth
        this.scale = 0.5 + Math.random() * 0.5;
        this.quoteIdx = Math.floor(Math.random() * quotes.length);
        this.color = colors[Math.floor(Math.random() * colors.length)];

        ctx.font = `italic 600 ${fontSize}px 'Outfit', sans-serif`;
        this.textWidth = ctx.measureText(quotes[this.quoteIdx]).width;
        this.textHeight = fontSize;

        while (!validPos && attempts < 20) {
            this.x = Math.random() * (width - this.textWidth);
            this.y = Math.random() * (height - this.textHeight) + this.textHeight;

            validPos = true;
            for (const rect of rects) {
                if (
                    this.x + this.textWidth + 20 > rect.left &&
                    this.x - 20 < rect.right &&
                    this.y + 20 > rect.top &&
                    this.y - this.textHeight - 20 < rect.bottom
                ) {
                    validPos = false;
                    break;
                }
            }
            attempts++;
        }

        // DVD Screensaver style: constant slow speed
        const speed = 0.4 + Math.random() * 0.4;
        this.vx = (Math.random() < 0.5 ? 1 : -1) * speed;
        this.vy = (Math.random() < 0.5 ? 1 : -1) * speed;
    }

    update(rects) {
        let proposedX = this.x + this.vx;
        let proposedY = this.y + this.vy;

        // Bounce off screen edges
        if (proposedX <= 5 || proposedX + this.textWidth >= width - 5) {
            this.vx *= -1;
            proposedX = this.x + this.vx;
        }
        if (proposedY - this.textHeight <= 5 || proposedY >= height - 5) {
            this.vy *= -1;
            proposedY = this.y + this.vy;
        }

        // Collision detection with floating boxes (HUD)
        for (const rect of rects) {
            if (
                proposedX + this.textWidth > rect.left &&
                proposedX < rect.right &&
                proposedY > rect.top &&
                proposedY - this.textHeight < rect.bottom
            ) {
                const prevX = this.x;
                // Determine collision side
                if (prevX + this.textWidth <= rect.left || prevX >= rect.right) {
                    this.vx *= -1;
                } else {
                    this.vy *= -1;
                }
                this.x += this.vx * 2;
                this.y += this.vy * 2;
                return;
            }
        }

        this.x = proposedX;
        this.y = proposedY;
    }

    draw() {
        ctx.font = `italic 600 ${fontSize}px 'Outfit', sans-serif`;
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.08 * this.scale; // Even more subtle
        ctx.fillText(quotes[this.quoteIdx], this.x, this.y);
        ctx.globalAlpha = 1.0;
    }
}

function init() {
    resize();
    for (let i = 0; i < elementCount; i++) {
        elements.push(new QuoteElement());
    }
    animate();
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

function animate() {
    // Transparent trails to keep back.jpg visible
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'source-over';

    const obstacleRects = Array.from(document.querySelectorAll('.glass-card, .side-panel'))
        .map(el => el.getBoundingClientRect());

    elements.forEach(el => {
        el.update(obstacleRects);
        el.draw();
    });

    requestAnimationFrame(animate);
}

window.addEventListener('resize', resize);

const floatingElements = document.querySelectorAll('.glass-card, .side-panel');

window.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    floatingElements.forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        const xInside = mouseX - rect.left;
        const yInside = mouseY - rect.top;
        el.style.setProperty('--mouse-x', `${xInside}px`);
        el.style.setProperty('--mouse-y', `${yInside}px`);

        const depthFactor = index === 1 ? 50 : 80;
        const moveX = (mouseX - window.innerWidth / 2) / depthFactor;
        const moveY = (mouseY - window.innerHeight / 2) / depthFactor;

        el.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.01)`;
    });
});

window.addEventListener('mouseleave', () => {
    floatingElements.forEach(el => {
        el.style.transform = `translate(0, 0) scale(1)`;
    });
});

init();
