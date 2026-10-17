/* ==================== SLIDE NAVIGATION SYSTEM ==================== */
const slides = document.querySelectorAll('.slide');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const indicatorsContainer = document.getElementById('indicators');
let currentSlide = 0;

// Create Indicator Dots
slides.forEach((_, idx) => {
  const dot = document.createElement('div');
  dot.classList.add('dot');
  if (idx === 0) dot.classList.add('active');
  dot.addEventListener('click', () => goToSlide(idx));
  indicatorsContainer.appendChild(dot);
});

const dots = document.querySelectorAll('.dot');

function updateSlides() {
  slides.forEach((slide, idx) => {
    slide.classList.toggle('active', idx === currentSlide);
    dots[idx].classList.toggle('active', idx === currentSlide);
  });
}

function goToSlide(index) {
  currentSlide = index;
  updateSlides();
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % slides.length;
  updateSlides();
}

function prevSlide() {
  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  updateSlides();
}

nextBtn.addEventListener('click', nextSlide);
prevBtn.addEventListener('click', prevSlide);

// Keyboard Arrow Navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') nextSlide();
  if (e.key === 'ArrowLeft') prevSlide();
});

/* ==================== AMBIENT CANVAS PARTICLES (Hearts, Flowers, Rain) ==================== */
const canvas = document.getElementById('ambient-canvas');
const ctx = canvas.getContext('2d');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

let particles = [];
let isRaining = false;

class Particle {
  constructor(type = 'petal', spread = false) {
    this.reset(type, spread);
  }

  reset(type = 'petal', spread = false) {
    this.type = type;
    this.x = Math.random() * width;
    // spread = true: partikel langsung tersebar di layar (dipakai untuk hujan)
    if (spread) {
      this.y = Math.random() * height;
    } else if (type === 'rain') {
      this.y = Math.random() * -60; // hujan turun terus tanpa jeda
    } else {
      this.y = Math.random() * -height;
    }
    this.size = Math.random() * 12 + 8;
    this.speedY = Math.random() * 1.5 + 0.8;
    this.speedX = Math.random() * 1 - 0.5;
    this.opacity = Math.random() * 0.7 + 0.3;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.02;

    if (type === 'rain') {
      this.speedY = Math.random() * 8 + 6;
      this.speedX = -1;
      this.length = Math.random() * 20 + 10;
    }
  }

  update() {
    this.y += this.speedY;
    this.x += this.speedX;
    this.rotation += this.rotSpeed;

    if (this.y > height) {
      this.reset(this.type);
    }
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.opacity;

    if (this.type === 'rain') {
      ctx.strokeStyle = '#a5f3fc';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + this.speedX, this.y + this.length);
      ctx.stroke();
    } else {
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.fillStyle = this.type === 'heart' ? '#f43f5e' : '#fbcfe8';

      // Draw Heart or Petal
      ctx.beginPath();
      ctx.arc(-this.size / 4, 0, this.size / 4, 0, Math.PI, true);
      ctx.arc(this.size / 4, 0, this.size / 4, 0, Math.PI, true);
      ctx.lineTo(0, this.size / 2);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }
}

// Initialize Floating Petals & Hearts
for (let i = 0; i < 25; i++) {
  particles.push(new Particle(i % 2 === 0 ? 'petal' : 'heart'));
}

function animateParticles() {
  ctx.clearRect(0, 0, width, height);
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  requestAnimationFrame(animateParticles);
}
animateParticles();

// Toggle Rain Feature
const rainToggleBtn = document.getElementById('rainToggleBtn');
const rainBtnText = document.getElementById('rainBtnText');

rainToggleBtn.addEventListener('click', () => {
  isRaining = !isRaining;
  if (isRaining) {
    rainBtnText.textContent = 'Matikan Hujan';
    for (let i = 0; i < 120; i++) {
      particles.push(new Particle('rain', true));
    }
  } else {
    rainBtnText.textContent = 'Aktifkan Hujan';
    particles = particles.filter(p => p.type !== 'rain');
  }
});

/* ==================== AUDIO & INTERACTIVE EFFECTS ==================== */

// BGM & Vinyl Toggle Animation
const bgmToggle = document.getElementById('bgmToggle');
const vinylRecord = document.getElementById('vinylRecord');
const bgmIcon = document.getElementById('bgmIcon');
const bgmText = document.getElementById('bgmText');
let isPlaying = false;

// Web Audio API Synthetic BGM Tone Generator
let audioCtx = null;
let bgmInterval = null;

function playSoftBGM() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  const notes = [261.63, 329.63, 392.00, 523.25]; // C, E, G, C
  let noteIdx = 0;

  bgmInterval = setInterval(() => {
    if (!isPlaying) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(notes[noteIdx % notes.length], audioCtx.currentTime);

    gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.8);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 2);
    noteIdx++;
  }, 800);
}

function stopBGM() {
  isPlaying = false;
  bgmIcon.classList.replace('fa-pause', 'fa-music');
  bgmText.textContent = 'Putar Musik Santai 🎵';
  clearInterval(bgmInterval);
}

bgmToggle.addEventListener('click', () => {
  if (!isPlaying) {
    songAudio.pause(); // jangan tabrakan dengan lagu utama
    isPlaying = true;
    bgmIcon.classList.replace('fa-music', 'fa-pause');
    bgmText.textContent = 'Musik Berputar ~ ✨';
    playSoftBGM();
  } else {
    stopBGM();
  }
});

/* ==================== SONG PLAYER (Somebody Pleasure) ==================== */
const songAudio = document.getElementById('songAudio');
const songBtn = document.getElementById('songBtn');
const songIcon = document.getElementById('songIcon');
const songProgress = document.getElementById('songProgress');
const songProgressBar = document.getElementById('songProgressBar');
const songTime = document.getElementById('songTime');
const songError = document.getElementById('songError');

function formatTime(sec) {
  if (!isFinite(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

songBtn.addEventListener('click', () => {
  if (songAudio.paused) {
    if (isPlaying) stopBGM(); // matikan musik santai dulu
    songError.style.display = 'none';
    songAudio.play().catch(() => {
      songError.style.display = 'block';
    });
  } else {
    songAudio.pause();
  }
});

songAudio.addEventListener('play', () => {
  songIcon.classList.replace('fa-play', 'fa-pause');
  vinylRecord.classList.add('playing');
});

songAudio.addEventListener('pause', () => {
  songIcon.classList.replace('fa-pause', 'fa-play');
  vinylRecord.classList.remove('playing');
});

songAudio.addEventListener('ended', () => {
  songProgressBar.style.width = '0%';
  songTime.textContent = '0:00';
});

songAudio.addEventListener('timeupdate', () => {
  if (songAudio.duration) {
    songProgressBar.style.width = (songAudio.currentTime / songAudio.duration) * 100 + '%';
  }
  songTime.textContent = formatTime(songAudio.currentTime);
});

songAudio.addEventListener('error', () => {
  songError.style.display = 'block';
});

// Klik progress bar untuk loncat ke bagian lagu
songProgress.addEventListener('click', (e) => {
  if (!songAudio.duration) return;
  const rect = songProgress.getBoundingClientRect();
  songAudio.currentTime = ((e.clientX - rect.left) / rect.width) * songAudio.duration;
});

// Sound FX Generators
function playPopSound() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(400, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.1);
  gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.1);
}

function playMeowSound() {
  playPopSound();
  alert('🐱 Meow! Kucing lucu bilang halo!');
}

function playWaddleSound() {
  playPopSound();
  alert('🐧 Pinguin imut sedang kepak-kepak sayap!');
}

/* ==================== FINAL REVEAL CONFETTI ==================== */
const revealBtn = document.getElementById('revealBtn');
const secretMessage = document.getElementById('secretMessage');

revealBtn.addEventListener('click', () => {
  revealBtn.style.display = 'none';
  secretMessage.style.display = 'block';

  // Confetti Explosion
  if (typeof confetti === 'function') {
    const count = 200;
    const defaults = { origin: { y: 0.7 } };

    function fire(particleRatio, opts) {
      confetti(Object.assign({}, defaults, opts, {
        particleCount: Math.floor(count * particleRatio)
      }));
    }

    fire(0.25, { spread: 26, startVelocity: 55, colors: ['#f43f5e', '#ec4899'] });
    fire(0.2, { spread: 60, colors: ['#a855f7', '#3b82f6'] });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, colors: ['#eab308', '#22c55e'] });
    fire(0.1, { spread: 120, startVelocity: 45 });
  }
});