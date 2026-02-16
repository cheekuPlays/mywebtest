/* Helpers */
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
function lerp(a, b, t) { return a + (b - a) * t }

/* Elements */
const body = document.body;
const spotlight = $('#spotlight');
const cursorGlow = $('#cursorGlow');
const logo = $('#logoBtn');
const confettiCanvas = $('#confetti');
const tabs = $$('.tab');
const statusDot = $('#statusDot');
const statusBox = $('#statusToggle');
const bottomMsg = $('#bottomMsg');

/* Loading intro */
window.addEventListener('load', () => {
    setTimeout(() => {
        body.classList.remove('loading');
        body.classList.add('loaded');
    }, 200);
});

/* Spotlight & cursor glow RAF (single loop) */
let mouse = { x: -9999, y: -9999 };
let x = -9999, y = -9999;
const ease = 0.16;

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX; mouse.y = e.clientY;
    spotlight.style.opacity = '0.92';
    cursorGlow.style.opacity = '1';
});
window.addEventListener('mouseleave', () => {
    spotlight.style.opacity = '0';
    cursorGlow.style.opacity = '0';
});

function rafLoop() {
    x = lerp(x, mouse.x, ease);
    y = lerp(y, mouse.y, ease);
    // center spotlight (half of default sizes)
    spotlight.style.transform = `translate3d(${Math.round(x - 260)}px, ${Math.round(y - 260)}px, 0)`;
    cursorGlow.style.transform = `translate3d(${Math.round(x - 60)}px, ${Math.round(y - 60)}px, 0)`;
    requestAnimationFrame(rafLoop);
}
requestAnimationFrame(rafLoop);


/* Scroll Animations (Intersection Observer) */
const observerOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            // Optional: Stop observing once revealed
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

$$('.reveal').forEach(el => observer.observe(el));


/* Navigation Active State Support */
const sections = $$('section');
const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // highlight corresponding tab
            const id = entry.target.id;
            tabs.forEach(t => {
                t.classList.toggle('active-link', t.getAttribute('href') === `#${id}`);
            });
        }
    });
}, { threshold: 0.5 }); // Activate when 50% visible

sections.forEach(s => navObserver.observe(s));


/* Confetti logic (retained) */
confettiCanvas.width = window.innerWidth; confettiCanvas.height = window.innerHeight;
window.addEventListener('resize', () => { confettiCanvas.width = window.innerWidth; confettiCanvas.height = window.innerHeight; });

let confettiActive = false;
logo.addEventListener('click', (e) => {
    if (confettiActive) return;
    confettiActive = true;
    logo.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-10px) rotate(-4deg)' }, { transform: 'translateY(2px) rotate(4deg)' }, { transform: 'translateY(0)' }], { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)' });
    const rect = logo.getBoundingClientRect();
    const sx = rect.left + rect.width / 2;
    const sy = rect.top + rect.height / 2;
    runConfetti(sx, sy, () => { confettiActive = false; });
});

function runConfetti(sx, sy, onDone) {
    const ctx = confettiCanvas.getContext('2d');
    const parts = []; const count = 40;
    const start = performance.now();
    for (let i = 0; i < count; i++) {
        parts.push({
            x: sx + (Math.random() - 0.5) * 40,
            y: sy + (Math.random() - 0.5) * 14,
            vx: (Math.random() - 0.5) * 8,
            vy: -6 - Math.random() * 6,
            r: 6 + Math.random() * 6,
            color: ['#ff6b6b', '#ffd166', '#4ecdc4', '#ffd1ff', '#ffb86b'][Math.floor(Math.random() * 5)],
            rot: Math.random() * 360,
            drot: (Math.random() - 0.5) * 8
        });
    }
    function frame(now) {
        const t = now - start;
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        for (let p of parts) {
            p.vy += 0.28;
            p.x += p.vx; p.y += p.vy; p.rot += p.drot;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot * Math.PI / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6);
            ctx.restore();
        }
        if (t < 3000) requestAnimationFrame(frame);
        else { ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height); onDone(); }
    }
    requestAnimationFrame(frame);
}

/* Status Easter Egg */
function showBottomMessage(msg, duration = 2000) {
    bottomMsg.textContent = msg;
    bottomMsg.classList.add('show');
    setTimeout(() => bottomMsg.classList.remove('show'), duration);
}

statusBox.addEventListener('click', () => {
    statusDot.classList.add('flicker');
    showBottomMessage('Currently building cool stuff', 2000);
    setTimeout(() => statusDot.classList.remove('flicker'), 1000);
});

/* small UX: cursor glow size on mousedown */
window.addEventListener('mousedown', () => { cursorGlow.style.width = '160px'; cursorGlow.style.height = '160px'; });
window.addEventListener('mouseup', () => { cursorGlow.style.width = '120px'; cursorGlow.style.height = '120px'; });
