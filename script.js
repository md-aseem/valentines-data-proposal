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

    // 1. Particle Systems - Simplified (removed for elegance)
    // Removed falling hearts and sparkles for a cleaner aesthetic

    // Removed emoji burst effect for a cleaner aesthetic

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
            }
        };
        requestAnimationFrame(update);
    }

    function showSlide(index) {
        if (index >= slides.length) return;

        // Essential Fix: Hide the evasive 'No' button when moving to the reward slide
        // since it might have been moved to document.body and won't be hidden by slide transitions.
        if (index === 5 && noBtn) {
            noBtn.style.display = 'none';
        }

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
            actions.innerHTML = `<button class="btn-response">Wait, what is this?</button>`;
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
        // Essential fix: Move button to body so 'fixed' positioning is relative to viewport,
        // ignoring any transformed parents that would shift the coordinates.
        if (noBtn.parentElement !== document.body) {
            document.body.appendChild(noBtn);
        }

        const x = Math.random() * (window.innerWidth - noBtn.offsetWidth - 40) + 20;
        const y = Math.random() * (window.innerHeight - noBtn.offsetHeight - 40) + 20;
        noBtn.style.position = 'fixed';
        noBtn.style.left = `${x}px`;
        noBtn.style.top = `${y}px`;
        noBtn.style.zIndex = '999999'; // Ensure it's on top of everything

        // Removed emoji reactions for cleaner aesthetic
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
