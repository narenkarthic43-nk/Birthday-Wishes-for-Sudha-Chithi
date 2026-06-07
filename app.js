// --- DESIGN CONSTANTS & CONFIGURATION ---
const FREQS = {
  'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
  'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
  'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
  'C6': 1046.50
};

const happyBirthdayNotes = [
  { note: 'G4', duration: 0.75 },
  { note: 'G4', duration: 0.25 },
  { note: 'A4', duration: 1 },
  { note: 'G4', duration: 1 },
  { note: 'C5', duration: 1 },
  { note: 'B4', duration: 2 },
  
  { note: 'G4', duration: 0.75 },
  { note: 'G4', duration: 0.25 },
  { note: 'A4', duration: 1 },
  { note: 'G4', duration: 1 },
  { note: 'D5', duration: 1 },
  { note: 'C5', duration: 2 },
  
  { note: 'G4', duration: 0.75 },
  { note: 'G4', duration: 0.25 },
  { note: 'G5', duration: 1 },
  { note: 'E5', duration: 1 },
  { note: 'C5', duration: 1 },
  { note: 'B4', duration: 1 },
  { note: 'A4', duration: 2 },
  
  { note: 'F5', duration: 0.75 },
  { note: 'F5', duration: 0.25 },
  { note: 'E5', duration: 1 },
  { note: 'C5', duration: 1 },
  { note: 'D5', duration: 1 },
  { note: 'C5', duration: 2 }
];

const PRESET_WISHES = [
  { text: "Dear Sudha Chithi, you are the warmest ray of sunshine in our family. Your laugh is contagious, and your cooking is legendary! Happy Birthday!", sender: "Naren" },
  { text: "Happy Birthday Sudha Chithi! Thank you for the endless support, the secret treats, and for always understanding us like a friend.", sender: "The Family Squad" },
  { text: "Wishing you a year full of sparkling health, prosperity, and love. May this special day bring you all the happiness you deserve!", sender: "With Love, Always" }
];

// --- APP STATE ---
let activeEnvelope = false;
let candlesBlown = 0;
let isMusicPlaying = false;
let currentSlide = 0;
let backgroundParticles = [];
let confettiParticles = [];
let isContinuousConfetti = false;
let customWishes = [];

// Web Audio API Variables
let audioCtx = null;
let delayNode = null;
let feedbackNode = null;
let currentNoteIndex = 0;
let musicTimeoutId = null;

// --- INITIALIZATION ---
window.addEventListener('DOMContentLoaded', () => {
  initBackgroundCanvas();
  initConfettiCanvas();
  initEnvelope();
  initCarousel();
  initWishesBoard();
  initPopper();
  
  // Resize listeners
  window.addEventListener('resize', () => {
    resizeCanvas(document.getElementById('bg-canvas'));
    resizeCanvas(document.getElementById('confetti-canvas'));
  });
});

// --- CANVAS 1: BACKGROUND PARTICLES ---
function initBackgroundCanvas() {
  const canvas = document.getElementById('bg-canvas');
  resizeCanvas(canvas);
  const ctx = canvas.getContext('2d');
  
  // Create initial particles
  const count = 40;
  for (let i = 0; i < count; i++) {
    backgroundParticles.push(createBgParticle(canvas.width, canvas.height, true));
  }
  
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    backgroundParticles.forEach((p, idx) => {
      p.y -= p.speed;
      p.x += Math.sin(p.angle) * 0.4;
      p.angle += p.angleSpeed;
      p.rotation += p.rotationSpeed;
      
      // Reset particle if it goes off top
      if (p.y < -30) {
        backgroundParticles[idx] = createBgParticle(canvas.width, canvas.height, false);
      }
      
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity;
      
      if (p.shape === 'heart') {
        drawHeart(ctx, 0, 0, p.size);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
    
    requestAnimationFrame(animate);
  }
  animate();
}

function createBgParticle(width, height, randomY = false) {
  const colors = [
    'rgba(255, 64, 129, opacity)', // Pink
    'rgba(255, 215, 0, opacity)',  // Gold
    'rgba(187, 134, 252, opacity)', // Violet
    'rgba(224, 86, 253, opacity)'  // Purple
  ];
  const colorIndex = Math.floor(Math.random() * colors.length);
  const opacity = Math.random() * 0.2 + 0.1;
  const size = Math.random() * 8 + 4;
  
  return {
    x: Math.random() * width,
    y: randomY ? Math.random() * height : height + 30,
    size: size,
    speed: Math.random() * 0.5 + 0.2,
    angle: Math.random() * Math.PI * 2,
    angleSpeed: Math.random() * 0.02 - 0.01,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: Math.random() * 0.01 - 0.005,
    color: colors[colorIndex].replace('opacity', opacity.toString()),
    opacity: opacity,
    shape: Math.random() > 0.5 ? 'heart' : 'circle'
  };
}

function drawHeart(ctx, x, y, size) {
  ctx.beginPath();
  ctx.moveTo(x, y + size / 4);
  ctx.quadraticCurveTo(x, y - size / 2, x - size / 2, y - size / 2);
  ctx.quadraticCurveTo(x - size, y - size / 2, x - size, y + size / 4);
  ctx.quadraticCurveTo(x - size, y + size * 0.8, x, y + size * 1.3);
  ctx.quadraticCurveTo(x + size, y + size * 0.8, x + size, y + size / 4);
  ctx.quadraticCurveTo(x + size, y - size / 2, x + size / 2, y - size / 2);
  ctx.quadraticCurveTo(x, y - size / 2, x, y + size / 4);
  ctx.fill();
}

function resizeCanvas(canvas) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

// --- CANVAS 2: CONFETTI PHYSICS SYSTEM ---
function initConfettiCanvas() {
  const canvas = document.getElementById('confetti-canvas');
  resizeCanvas(canvas);
  const ctx = canvas.getContext('2d');
  
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Add continuous fall if enabled
    if (isContinuousConfetti && confettiParticles.length < 150) {
      if (Math.random() < 0.25) {
        confettiParticles.push(createConfettiParticle(Math.random() * canvas.width, -20, true));
      }
    }
    
    confettiParticles.forEach((p, idx) => {
      // Apply forces
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      
      // Wind oscillation
      p.x += Math.sin(p.windAngle) * 0.5;
      p.windAngle += 0.05;
      
      // Draw particle
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity;
      
      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.width / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'triangle') {
        ctx.beginPath();
        ctx.moveTo(0, -p.height / 2);
        ctx.lineTo(p.width / 2, p.height / 2);
        ctx.lineTo(-p.width / 2, p.height / 2);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
      }
      ctx.restore();
      
      // Remove offscreen particles
      if (p.y > canvas.height + 20 || p.x < -20 || p.x > canvas.width + 20) {
        confettiParticles.splice(idx, 1);
      }
    });
    
    requestAnimationFrame(animate);
  }
  animate();
}

function createConfettiParticle(x, y, fallOnly = false) {
  const colors = [
    '#ff4081', // Pink
    '#ffd700', // Gold
    '#00e5ff', // Teal/Cyan
    '#ab47bc', // Purple
    '#81c784', // Light Green
    '#ff7043', // Coral
    '#ffffff'  // White
  ];
  
  const shapeIdx = Math.floor(Math.random() * 3);
  const shapes = ['rect', 'circle', 'triangle'];
  
  const angle = Math.random() * Math.PI * 2;
  const speed = Math.random() * 8 + 3;
  
  return {
    x: x,
    y: y,
    width: Math.random() * 12 + 6,
    height: Math.random() * 14 + 8,
    vx: fallOnly ? Math.random() * 2 - 1 : Math.cos(angle) * speed,
    vy: fallOnly ? Math.random() * 2 + 1 : Math.sin(angle) * speed - 3,
    gravity: 0.12,
    windAngle: Math.random() * Math.PI,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: Math.random() * 0.2 - 0.1,
    color: colors[Math.floor(Math.random() * colors.length)],
    opacity: Math.random() * 0.3 + 0.7,
    shape: shapes[shapeIdx]
  };
}

function triggerConfettiBurst(x, y, count = 60) {
  for (let i = 0; i < count; i++) {
    confettiParticles.push(createConfettiParticle(x, y, false));
  }
}

// --- MUSIC AUDIO BOX (WEB AUDIO SYNTH) ---
function initAudio() {
  if (audioCtx) return; // Already initialized
  
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  
  // Set up reverb delay line
  delayNode = audioCtx.createDelay(1.0);
  delayNode.delayTime.value = 0.28;
  
  feedbackNode = audioCtx.createGain();
  feedbackNode.gain.value = 0.35;
  
  delayNode.connect(feedbackNode);
  feedbackNode.connect(delayNode);
  
  // Connect delay to destination
  delayNode.connect(audioCtx.destination);
}

function playNote(freq, startTime, duration) {
  if (!audioCtx) return;
  
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  // Custom music box oscillator type (triangle is softest and bell-like)
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, startTime);
  
  // Subtle vibrato (frequency modulation)
  const lfo = audioCtx.createOscillator();
  const lfoGain = audioCtx.createGain();
  lfo.frequency.value = 6.0; // 6Hz modulation
  lfoGain.gain.value = 2.0;  // 2Hz sweep depth
  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);
  
  // Gain envelope
  gainNode.gain.setValueAtTime(0, startTime);
  // Sweet pluck attack
  gainNode.gain.linearRampToValueAtTime(0.18, startTime + 0.02);
  // Natural long exponential decay like physical metal keys
  gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration - 0.02);
  
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  gainNode.connect(delayNode); // Feed reverb delay
  
  lfo.start(startTime);
  osc.start(startTime);
  
  lfo.stop(startTime + duration);
  osc.stop(startTime + duration);
}

function playMelodyLoop() {
  if (!isMusicPlaying) return;
  
  initAudio();
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  
  const noteInfo = happyBirthdayNotes[currentNoteIndex];
  const freq = FREQS[noteInfo.note];
  const baseDuration = 0.42; // Tempo speed
  const noteDuration = noteInfo.duration * baseDuration;
  
  playNote(freq, audioCtx.currentTime, noteDuration);
  
  currentNoteIndex = (currentNoteIndex + 1) % happyBirthdayNotes.length;
  
  // Schedule next step
  const timeToNext = noteInfo.duration * baseDuration * 1000;
  musicTimeoutId = setTimeout(playMelodyLoop, timeToNext);
}

function startMusic() {
  isMusicPlaying = true;
  document.getElementById('music-toggle').classList.add('active');
  playMelodyLoop();
}

function stopMusic() {
  isMusicPlaying = false;
  document.getElementById('music-toggle').classList.remove('active');
  if (musicTimeoutId) {
    clearTimeout(musicTimeoutId);
    musicTimeoutId = null;
  }
}

// Sparkle sound chime
function playSparkleSound() {
  initAudio();
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  
  const startTime = audioCtx.currentTime;
  
  // Sweep upward frequency
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, startTime);
  osc.frequency.exponentialRampToValueAtTime(1800, startTime + 0.35);
  
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(0.12, startTime + 0.05);
  gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);
  
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  gainNode.connect(delayNode);
  
  osc.start(startTime);
  osc.stop(startTime + 0.35);
}

// Celebration Fanfare chords
function playFanfareSound() {
  initAudio();
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  
  const startTime = audioCtx.currentTime;
  const chordNotes = ['C4', 'E4', 'G4', 'C5', 'E5', 'G5', 'C6'];
  
  chordNotes.forEach((noteName, idx) => {
    const freq = FREQS[noteName];
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime + idx * 0.06);
    
    const noteStart = startTime + idx * 0.06;
    gainNode.gain.setValueAtTime(0, noteStart);
    gainNode.gain.linearRampToValueAtTime(0.1, noteStart + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.7);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    gainNode.connect(delayNode);
    
    osc.start(noteStart);
    osc.stop(noteStart + 0.7);
  });
}

// Music Button toggle
document.getElementById('music-toggle').addEventListener('click', () => {
  if (isMusicPlaying) {
    stopMusic();
  } else {
    startMusic();
  }
});

// --- STEP 1: ENVELOPE HANDLER ---
function initEnvelope() {
  const envelopeContainer = document.getElementById('envelope-container');
  const envelopeWrapper = document.querySelector('.envelope-wrapper');
  
  envelopeWrapper.addEventListener('click', () => {
    if (activeEnvelope) return;
    activeEnvelope = true;
    
    // Play sound & open wrapper
    envelopeWrapper.classList.add('open');
    playSparkleSound();
    
    // Switch screens with smooth animation
    setTimeout(() => {
      // Fade out envelope container
      envelopeContainer.style.opacity = '0';
      envelopeContainer.style.transform = 'scale(0.9)';
      
      setTimeout(() => {
        envelopeContainer.classList.add('hidden');
        
        // Show main dashboard
        const mainCeleb = document.getElementById('main-celebration');
        mainCeleb.classList.remove('hidden');
        
        // Trigger initial burst of confetti
        triggerConfettiBurst(window.innerWidth / 2, window.innerHeight / 2, 70);
        
        // Start playing the synthesized music automatically
        startMusic();
        
        // Start auto-confetti after celebration is visible
        startAutoConfetti();
      }, 500);
      
    }, 1500); // Wait for open envelope letters to rise up fully
  });
}

// --- INTERACTIVE CANDLE BLOWING ---
function extinguishCandle(id) {
  const candleDiv = document.getElementById(`candle-${id}`);
  
  if (candleDiv.classList.contains('extinguished')) return;
  
  candleDiv.classList.add('extinguished');
  candlesBlown++;
  
  // Play chime for individual candle
  playSparkleSound();
  
  // Trigger a puff particle burst right at the candle position
  const rect = candleDiv.getBoundingClientRect();
  triggerConfettiBurst(rect.left + rect.width / 2, rect.top, 15);
  
  // Update status message
  const statusDiv = document.getElementById('cake-status');
  if (candlesBlown === 1) {
    statusDiv.textContent = "2 candles are remaining!";
  } else if (candlesBlown === 2) {
    statusDiv.textContent = "Only 1 candle left to blow!";
  } else if (candlesBlown === 3) {
    statusDiv.innerHTML = "🌟 Make a wish! All candles blown! 🌟";
    statusDiv.style.color = "var(--color-rose)";
    
    // Huge explosion of celebration
    setTimeout(() => {
      triggerConfettiBurst(window.innerWidth / 2, window.innerHeight * 0.4, 120);
      playFanfareSound();
      
      // Turn on gentle continuous falling confetti for background cheer!
      isContinuousConfetti = true;
      
      // Auto Popper active for more burst
      setTimeout(() => {
        triggerConfettiBurst(window.innerWidth * 0.2, window.innerHeight * 0.5, 40);
        triggerConfettiBurst(window.innerWidth * 0.8, window.innerHeight * 0.5, 40);
      }, 800);
      
      // Open wishes page in new tab after celebration
      setTimeout(() => {
        window.open('wishes.html', '_blank');
      }, 1500);
    }, 200);
  }
}

// Expose candle blow to window scope so onclick in html works
window.extinguishCandle = extinguishCandle;

// --- CAROUSEL SLIDER ENGINE ---
function initCarousel() {
  const track = document.getElementById('carousel-track');
  const slides = Array.from(track.children);
  const nextBtn = document.getElementById('next-btn');
  const prevBtn = document.getElementById('prev-btn');
  const indicatorsContainer = document.getElementById('carousel-indicators');
  
  // Add active state to first slide
  slides[0].classList.add('active');
  
  // Create indicators
  slides.forEach((_, idx) => {
    const dot = document.createElement('div');
    dot.classList.add('indicator');
    if (idx === 0) dot.classList.add('active');
    dot.addEventListener('click', () => moveToSlide(idx));
    indicatorsContainer.appendChild(dot);
  });
  
  const indicators = Array.from(indicatorsContainer.children);
  
  function moveToSlide(index) {
    track.style.transform = `translateX(-${index * 100}%)`;
    
    slides.forEach(s => s.classList.remove('active'));
    indicators.forEach(ind => ind.classList.remove('active'));
    
    slides[index].classList.add('active');
    indicators[index].classList.add('active');
    currentSlide = index;
  }
  
  nextBtn.addEventListener('click', () => {
    let nextIndex = (currentSlide + 1) % slides.length;
    moveToSlide(nextIndex);
  });
  
  prevBtn.addEventListener('click', () => {
    let prevIndex = (currentSlide - 1 + slides.length) % slides.length;
    moveToSlide(prevIndex);
  });
  
  // Autoplay carousel slides
  let carouselTimer = setInterval(() => {
    let nextIndex = (currentSlide + 1) % slides.length;
    moveToSlide(nextIndex);
  }, 7000);
  
  // Reset timer on button click
  const resetTimer = () => {
    clearInterval(carouselTimer);
    carouselTimer = setInterval(() => {
      let nextIndex = (currentSlide + 1) % slides.length;
      moveToSlide(nextIndex);
    }, 7000);
  };
  
  nextBtn.addEventListener('click', resetTimer);
  prevBtn.addEventListener('click', resetTimer);
}

// --- WISH BOARD / STORAGE ---
function initWishesBoard() {
  const board = document.getElementById('board-messages');
  const submitBtn = document.getElementById('submit-wish-btn');
  const senderInput = document.getElementById('wish-sender');
  const textInput = document.getElementById('wish-text');
  
  // Load wishes
  const savedWishes = localStorage.getItem('chithi_birthday_wishes');
  if (savedWishes) {
    customWishes = JSON.parse(savedWishes);
  } else {
    customWishes = [...PRESET_WISHES];
    localStorage.setItem('chithi_birthday_wishes', JSON.stringify(customWishes));
  }
  
  renderWishes();
  
  submitBtn.addEventListener('click', () => {
    const sender = senderInput.value.trim();
    const text = textInput.value.trim();
    
    if (!sender || !text) {
      alert("Please enter both your name and a lovely wish!");
      return;
    }
    
    const newWish = { text, sender };
    customWishes.unshift(newWish); // Add to beginning
    localStorage.setItem('chithi_birthday_wishes', JSON.stringify(customWishes));
    
    // Clear inputs
    senderInput.value = '';
    textInput.value = '';
    
    renderWishes();
    
    // Visual celebrate
    const btnRect = submitBtn.getBoundingClientRect();
    triggerConfettiBurst(btnRect.left + btnRect.width / 2, btnRect.top, 25);
    playSparkleSound();
  });
}

function renderWishes() {
  const board = document.getElementById('board-messages');
  board.innerHTML = '';
  
  customWishes.forEach(wish => {
    const card = document.createElement('div');
    card.classList.add('wish-card');
    
    const textP = document.createElement('p');
    textP.classList.add('wish-card-text');
    textP.textContent = `"${wish.text}"`;
    
    const senderP = document.createElement('p');
    senderP.classList.add('wish-card-sender');
    senderP.textContent = `— ${wish.sender}`;
    
    card.appendChild(textP);
    card.appendChild(senderP);
    board.appendChild(card);
  });
}

// --- CONFETTI BURST HELPER ---
function releasePartyConfetti() {
  const popperBtn = document.getElementById('party-popper-btn');
  if (!popperBtn) return;
  
  const rect = popperBtn.getBoundingClientRect();
  
  // Main burst from button
  triggerConfettiBurst(rect.left + rect.width / 2, rect.top, 60);

  setTimeout(() => {
    triggerConfettiBurst(window.innerWidth * 0.15, window.innerHeight * 0.3, 40);
    triggerConfettiBurst(window.innerWidth * 0.85, window.innerHeight * 0.3, 40);
  }, 250);

  setTimeout(() => {
    triggerConfettiBurst(window.innerWidth / 2, window.innerHeight * 0.2, 50);
  }, 500);
}

// --- AUTO CONFETTI TRIGGER ---
let autoConfettiInterval = null;

function startAutoConfetti() {
  // Auto-trigger confetti every 8 seconds
  autoConfettiInterval = setInterval(() => {
    releasePartyConfetti();
  }, 8000);
  console.log('Auto confetti started');
}

function stopAutoConfetti() {
  if (autoConfettiInterval) {
    clearInterval(autoConfettiInterval);
    autoConfettiInterval = null;
  }
}

// --- EXTRA SURPRISE POPPER ---
function initPopper() {
  const popperBtn = document.getElementById('party-popper-btn');
  
  // Manual click trigger
  popperBtn.addEventListener('click', () => {
    releasePartyConfetti();
    playSparkleSound();
  });
}
