document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.slide');
    const envelope = document.getElementById('envelope');
    const slideshow = document.getElementById('slideshow');
    const yesBtn = document.getElementById('yes-btn');
    const noBtn = document.getElementById('no-btn');
    const rewardVideo = document.getElementById('reward-video');
    const heartContainer = document.getElementById('hearts-particles');

    let currentSlide = 0;

    // Heart Particle Generator
    function createHeart() {
        const heart = document.createElement('div');
        heart.classList.add('heart');
        heart.innerHTML = '❤️';
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.fontSize = Math.random() * 20 + 20 + 'px';
        heart.style.animationDuration = Math.random() * 3 + 2 + 's';
        heartContainer.appendChild(heart);

        setTimeout(() => {
            heart.remove();
        }, 5000);
    }
    setInterval(createHeart, 300);

    // Envelope Opening -> Next Slide
    envelope.addEventListener('click', () => {
        envelope.classList.add('open');
        setTimeout(nextSlide, 1500);
    });

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
        currentSlide = index;

        // If Page 2, start count-up
        if (index === 1) {
            document.querySelectorAll('.count').forEach(counter => {
                animateCounter(counter);
            });
        }
    }

    function animateCounter(counter) {
        const target = +counter.getAttribute('data-target');
        const count = +counter.innerText;
        const speed = target / 50;

        const updateCount = () => {
            const currentCount = +counter.innerText;
            if (currentCount < target) {
                counter.innerText = Math.ceil(currentCount + speed);
                setTimeout(updateCount, 20);
            } else {
                counter.innerText = target;
            }
        };
        updateCount();
    }

    function nextSlide() {
        if (currentSlide < slides.length - 1) {
            showSlide(currentSlide + 1);
        }
    }

    // Tap to navigate (Page 2 to Page 3)
    slideshow.addEventListener('click', (e) => {
        if (currentSlide === 1) {
            nextSlide();
        }
    });

    // Final Action: YES
    yesBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Don't trigger slide advance logic
        showSlide(3); // Show reward slide
        rewardVideo.play();
        triggerConfetti();
    });

    // Final Action: NO (Evasive)
    const moveNoButton = () => {
        const x = Math.random() * (window.innerWidth - noBtn.offsetWidth - 40) + 20;
        const y = Math.random() * (window.innerHeight - noBtn.offsetHeight - 40) + 20;

        noBtn.style.position = 'fixed';
        noBtn.style.left = `${x}px`;
        noBtn.style.top = `${y}px`;
        noBtn.style.zIndex = '9999';
    };

    noBtn.addEventListener('mouseover', moveNoButton);
    noBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        moveNoButton();
    });

    function triggerConfetti() {
        const duration = 15 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    }
});
