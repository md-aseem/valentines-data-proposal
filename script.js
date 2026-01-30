document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.slide');
    const envelope = document.getElementById('envelope');
    const yesBtn = document.getElementById('yes-btn');
    const noBtn = document.getElementById('no-btn');
    const rewardVideo = document.getElementById('reward-video');
    const heartContainer = document.getElementById('hearts-particles');
    const burstContainer = document.getElementById('burst-overlay');

    let currentSlideIndex = 0;
    let isTyping = false;

    // 1. Particle Systems
    function createFallingHeart() {
        const heart = document.createElement('div');
        heart.classList.add('heart');
        heart.innerHTML = '❤️';
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.fontSize = Math.random() * 20 + 20 + 'px';
        heart.style.animationDuration = Math.random() * 3 + 2 + 's';
        heartContainer.appendChild(heart);
        setTimeout(() => heart.remove(), 5000);
    }
    setInterval(createFallingHeart, 600);

    function createSparkle(x, y) {
        const sparkle = document.createElement('div');
        sparkle.classList.add('sparkle');
        sparkle.style.left = (x - 10) + 'px';
        sparkle.style.top = (y - 10) + 'px';
        document.body.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 1000);
    }

    window.addEventListener('mousemove', (e) => {
        if (Math.random() > 0.85) createSparkle(e.clientX, e.clientY);
    });

    function createBurst(x, y, emoji) {
        for (let i = 0; i < 12; i++) {
            const p = document.createElement('div');
            p.innerText = emoji;
            p.style.position = 'fixed';
            p.style.left = x + 'px';
            p.style.top = y + 'px';
            p.style.fontSize = '24px';
            p.style.pointerEvents = 'none';
            p.style.zIndex = '10000';

            const angle = (Math.PI * 2 / 12) * i;
            const velocity = 5 + Math.random() * 10;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;

            burstContainer.appendChild(p);

            let pos = { x, y };
            const animate = () => {
                pos.x += vx;
                pos.y += vy;
                p.style.left = pos.x + 'px';
                p.style.top = pos.y + 'px';
                p.style.opacity = parseFloat(p.style.opacity || 1) - 0.02;
                if (parseFloat(p.style.opacity) > 0) {
                    requestAnimationFrame(animate);
                } else {
                    p.remove();
                }
            };
            animate();
        }
    }

    // 2. Typewriter Logic
    async function typeText(element, text) {
        isTyping = true;
        element.innerText = '';
        for (const char of text) {
            element.innerText += char;
            await new Promise(r => setTimeout(r, 40 + Math.random() * 40));
        }
        isTyping = false;

        // Signal that typing is finished to reveal other items
        element.dispatchEvent(new CustomEvent('typingFinished'));
    }

    // 3. Slide Management
    async function initSlide(index) {
        const slide = slides[index];
        const typewriter = slide.querySelector('.typewriter');
        const revealItems = slide.querySelectorAll('.reveal-item');
        const actions = slide.querySelector('.response-actions');
        const counter = slide.querySelector('.count');

        // Reset slide state
        revealItems.forEach(item => item.classList.remove('show'));
        if (actions) actions.classList.remove('show');

        // Start Typewriter
        if (typewriter) {
            await typeText(typewriter, typewriter.getAttribute('data-text'));
        }

        // Reveal content
        revealItems.forEach((item, i) => {
            setTimeout(() => item.classList.add('show'), i * 200);
        });

        // Trigger Counter
        if (counter) {
            setTimeout(() => animateCounter(counter, slide), 400);
        }

        // Show Buttons
        if (actions) {
            setTimeout(() => actions.classList.add('show'), 800);
        }
    }

    function animateCounter(counter, slide) {
        const target = +counter.getAttribute('data-target');
        let current = 0;
        const duration = 1500;
        const startTime = performance.now();

        const update = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out quad
            const eased = progress * (2 - progress);
            current = Math.floor(eased * target);

            // Only add '+' if it's not the dates slide (index 3)
            const suffix = (progress === 1 && currentSlideIndex !== 3) ? '+' : '';
            counter.innerText = current + suffix;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                // Impact Effect
                slide.classList.add('shake');
                setTimeout(() => slide.classList.remove('shake'), 500);

                // Burst emoji based on slide
                const rect = counter.getBoundingClientRect();
                const emoji = currentSlideIndex === 1 ? '📱' : (currentSlideIndex === 2 ? '💬' : '🌹');
                createBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, emoji);
            }
        };
        requestAnimationFrame(update);
    }

    function showSlide(index) {
        if (index >= slides.length) return;

        slides.forEach((s, i) => {
            s.classList.toggle('active', i === index);
        });

        currentSlideIndex = index;
        initSlide(index);
    }

    // 4. Interaction Handlers
    envelope.addEventListener('click', (e) => {
        e.stopPropagation();
        envelope.classList.add('open');
        setTimeout(() => {
            const actions = slides[0].querySelector('.response-actions') || document.createElement('div');
            actions.classList.add('response-actions', 'show');
            actions.innerHTML = `<button class="btn-response">Wait, what is this? ❤️</button>`;
            slides[0].appendChild(actions);
            actions.querySelector('button').addEventListener('click', () => showSlide(1));
        }, 1500);
    });

    document.querySelectorAll('.btn-response').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            showSlide(currentSlideIndex + 1);
        });
    });

    yesBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showSlide(5);

        // Unmute and Play (User interaction allows this)
        rewardVideo.muted = false;
        rewardVideo.volume = 1.0;
        rewardVideo.play();

        triggerConfetti();

        // Reveal the invitation card after a delay to show the video first
        setTimeout(() => {
            const overlay = document.querySelector('.reward-overlay');
            if (overlay) overlay.classList.add('show');
        }, 1500);
    });

    // Evasive No Button
    const moveNoButton = () => {
        const x = Math.random() * (window.innerWidth - noBtn.offsetWidth - 40) + 20;
        const y = Math.random() * (window.innerHeight - noBtn.offsetHeight - 40) + 20;
        noBtn.style.position = 'fixed';
        noBtn.style.left = `${x}px`;
        noBtn.style.top = `${y}px`;

        // Spawn emoji reaction
        const emojis = ['🏃‍♂️', '💨', '💅', '🙄', '🤭'];
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];
        const el = document.createElement('div');
        el.className = 'reaction';
        el.innerText = emoji;
        el.style.left = x + 'px';
        el.style.top = y + 'px';
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 800);
    };

    noBtn.addEventListener('mouseover', moveNoButton);
    noBtn.addEventListener('touchstart', (e) => { e.preventDefault(); moveNoButton(); });

    function triggerConfetti() {
        const duration = 15 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };
        function randomInRange(min, max) { return Math.random() * (max - min) + min; }
        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);
            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    }

    // Start!
    initSlide(0);
});
