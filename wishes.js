// --- CAROUSEL SLIDER ENGINE ---
function setupCarousel(containerSelector, autoplayInterval = null, onSlideChange = null) {
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.warn(`Carousel container ${containerSelector} not found`);
    return;
  }

  const track = container.querySelector('.carousel-track');
  if (!track) {
    console.warn(`Carousel track not found in ${containerSelector}`);
    return;
  }

  const slides = Array.from(track.children);
  if (slides.length === 0) return;

  const nextBtn = container.querySelector('.next-btn');
  const prevBtn = container.querySelector('.prev-btn');
  const indicatorsContainer = container.querySelector('.carousel-indicators');

  console.log('Initializing carousel', containerSelector, 'with', slides.length, 'slides');

  // Make first slide active
  slides[0].classList.add('active');

  // Set background-image on each slide for blurred background effect (if photos carousel)
  if (containerSelector === '#photos-carousel') {
    slides.forEach(slide => {
      const img = slide.querySelector('img');
      if (img) {
        const updateBg = () => {
          slide.style.backgroundImage = `url('${img.src}')`;
        };
        img.addEventListener('load', updateBg);
        if (img.complete && img.naturalWidth > 0) {
          updateBg();
        } else {
          slide.style.backgroundImage = `url('${img.src}')`;
        }
      }
    });
  }

  // Create indicator dots
  if (indicatorsContainer) {
    indicatorsContainer.innerHTML = '';
    slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.classList.add('carousel-indicator');
      dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
      indicatorsContainer.appendChild(dot);
    });
    if (indicatorsContainer.children.length > 0) {
      indicatorsContainer.children[0].classList.add('active');
    }
  }

  const counterContainer = container.querySelector('.carousel-counter');

  const updateCounter = () => {
    if (counterContainer) {
      counterContainer.textContent = `${activeIndex + 1} / ${slides.length}`;
    }
  };

  let activeIndex = 0;
  const updateSlides = (newIndex) => {
    slides[activeIndex].classList.remove('active');
    if (indicatorsContainer && indicatorsContainer.children[activeIndex]) {
      indicatorsContainer.children[activeIndex].classList.remove('active');
    }

    activeIndex = newIndex;
    slides[activeIndex].classList.add('active');
    if (indicatorsContainer && indicatorsContainer.children[activeIndex]) {
      indicatorsContainer.children[activeIndex].classList.add('active');
    }

    updateCounter();
    track.style.transform = `translateX(-${activeIndex * 100}%)`;

    if (onSlideChange) {
      onSlideChange(activeIndex);
    }
  };

  // Set initial counter value
  updateCounter();

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const nextIndex = (activeIndex + 1) % slides.length;
      updateSlides(nextIndex);
      if (autoplayInterval) restartAutoplay();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      const prevIndex = (activeIndex - 1 + slides.length) % slides.length;
      updateSlides(prevIndex);
      if (autoplayInterval) restartAutoplay();
    });
  }

  if (indicatorsContainer) {
    Array.from(indicatorsContainer.children).forEach((dot, index) => {
      dot.addEventListener('click', () => {
        updateSlides(index);
        if (autoplayInterval) restartAutoplay();
      });
    });
  }

  // Autoplay
  let autoplayTimer = null;
  const startAutoplay = () => {
    if (!autoplayInterval) return;
    autoplayTimer = setInterval(() => {
      const nextIndex = (activeIndex + 1) % slides.length;
      updateSlides(nextIndex);
    }, autoplayInterval);
  };

  const restartAutoplay = () => {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      startAutoplay();
    }
  };

  if (autoplayInterval) {
    startAutoplay();
  }
}

// Function to resolve direct image links from Imghippo viewer URLs
function resolveDirectImage(imgElement, originalUrl) {
  if (!originalUrl || !originalUrl.includes('imghippo.com/i/')) {
    imgElement.src = originalUrl || '';
    return;
  }

  const match = originalUrl.match(/\/i\/([a-zA-Z0-9]+)/);
  if (!match) {
    imgElement.src = originalUrl;
    return;
  }

  const id = match[1];
  const extensions = ['jpg', 'png', 'jpeg', 'webp'];
  let attempt = 0;

  function tryNext() {
    if (attempt < extensions.length) {
      const ext = extensions[attempt];
      attempt++;
      imgElement.src = `https://i.imghippo.com/files/${id}.${ext}`;
    } else {
      // Clear onerror handler to prevent infinite recursive loop if originalUrl also fails
      imgElement.onerror = null;
      imgElement.src = originalUrl;
    }
  }

  imgElement.onerror = function () {
    tryNext();
  };

  tryNext();
}

// Pre-load floating background images
const floatingImages = [
  'https://www.imghippo.com/i/Cdf8268GiA.jpeg',
  'https://www.imghippo.com/i/ALQ4740Ads.jpeg',
  'https://www.imghippo.com/i/nYjt1211zyw.jpeg',
  'https://www.imghippo.com/i/NBm3871qTU.jpeg',
  'https://www.imghippo.com/i/fCDc9960RYM.jpeg',
  'https://www.imghippo.com/i/WRL5733YY.jpeg',
  'https://www.imghippo.com/i/Jw2292ooQ.jpeg',
  'https://www.imghippo.com/i/pzZ7033Reg.jpeg',
  'https://www.imghippo.com/i/PfT1122ISY.jpeg',
  'https://www.imghippo.com/i/JO3209ZJk.jpeg'
].map(url => {
  const img = new Image();
  resolveDirectImage(img, url);
  return img;
});

// --- BACKGROUND PARTICLES (SIMPLIFIED) ---
function initBackgroundCanvas() {
  const canvas = document.getElementById('bg-canvas');
  resizeCanvas(canvas);
  const ctx = canvas.getContext('2d');
  let particles = [];

  const count = 40;
  for (let i = 0; i < count; i++) {
    particles.push(createBgParticle(canvas.width, canvas.height, true));
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p, idx) => {
      p.y -= p.speed;
      p.x += Math.sin(p.angle) * 0.4;
      p.angle += p.angleSpeed;
      p.rotation += p.rotationSpeed;

      if (p.y < -50) {
        particles[idx] = createBgParticle(canvas.width, canvas.height, false);
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity;

      if (p.shape === 'heart') {
        drawHeart(ctx, 0, 0, p.size);
      } else if (p.shape === 'photo' && p.imageObj && p.imageObj.complete) {
        ctx.beginPath();
        // Clip floating photos in a soft bubble circle
        ctx.arc(0, 0, p.size * 2.8, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(p.imageObj, -p.size * 2.8, -p.size * 2.8, p.size * 5.6, p.size * 5.6);
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
    'rgba(255, 64, 129, opacity)',
    'rgba(255, 215, 0, opacity)',
    'rgba(187, 134, 252, opacity)',
    'rgba(224, 86, 253, opacity)'
  ];
  const colorIndex = Math.floor(Math.random() * colors.length);
  const opacity = Math.random() * 0.2 + 0.1;
  const size = Math.random() * 8 + 4;

  const shapeRand = Math.random();
  let shape = 'circle';
  let imageObj = null;

  if (shapeRand < 0.35) {
    shape = 'heart';
  } else if (shapeRand < 0.75) {
    shape = 'photo';
    imageObj = floatingImages[Math.floor(Math.random() * floatingImages.length)];
  }

  return {
    x: Math.random() * width,
    y: randomY ? Math.random() * height : height + 50,
    size: size,
    speed: Math.random() * 0.4 + 0.15,
    angle: Math.random() * Math.PI * 2,
    angleSpeed: Math.random() * 0.02 - 0.01,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: Math.random() * 0.01 - 0.005,
    color: colors[colorIndex].replace('opacity', opacity.toString()),
    opacity: opacity,
    shape: shape,
    imageObj: imageObj
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

// --- IMAGE GALLERY SYSTEM ---
const galleryImages = [
  'https://www.imghippo.com/i/Cdf8268GiA.jpeg',
  'https://www.imghippo.com/i/ALQ4740Ads.jpeg',
  'https://www.imghippo.com/i/nYjt1211zyw.jpeg',
  'https://www.imghippo.com/i/NBm3871qTU.jpeg',
  'https://www.imghippo.com/i/fCDc9960RYM.jpeg',
  'https://www.imghippo.com/i/WRL5733YY.jpeg',
  'https://www.imghippo.com/i/Jw2292ooQ.jpeg',
  'https://www.imghippo.com/i/pzZ7033Reg.jpeg',
  'https://www.imghippo.com/i/PfT1122ISY.jpeg',
  'https://www.imghippo.com/i/JO3209ZJk.jpeg'
];

// --- CONFETTI SYSTEM FOR PARTY POPPER ---
let confettiParticles = [];
let isContinuousConfetti = false;

function initConfettiCanvas() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
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

function releaseConfettiBurst() {
  // Main burst from center
  triggerConfettiBurst(window.innerWidth / 2, window.innerHeight * 0.2, 60);

  // Multi-burst effect
  setTimeout(() => {
    triggerConfettiBurst(window.innerWidth * 0.2, window.innerHeight * 0.3, 40);
    triggerConfettiBurst(window.innerWidth * 0.8, window.innerHeight * 0.3, 40);
  }, 200);

  setTimeout(() => {
    triggerConfettiBurst(window.innerWidth / 2, window.innerHeight * 0.5, 50);
  }, 400);
}

function initPartyPopper() {
  const popperBtn = document.getElementById('party-popper-btn');
  if (!popperBtn) return;

  // Auto-trigger confetti on page load
  setTimeout(() => {
    releaseConfettiBurst();
    console.log('Auto confetti triggered on page load');
  }, 1000);

  // Allow manual trigger via button click
  popperBtn.addEventListener('click', () => {
    releaseConfettiBurst();
    console.log('Confetti triggered manually');
  });

  // Auto-trigger confetti every 8 seconds for continuous celebration
  setInterval(() => {
    releaseConfettiBurst();
  }, 8000);
}

let currentGalleryIndex = 0;
let galleryAutoPlayInterval = null;

function initGallery() {
  const prevBtn = document.getElementById('gallery-prev-btn');
  const nextBtn = document.getElementById('gallery-next-btn');

  if (!prevBtn || !nextBtn) {
    return;
  }

  console.log('Initializing gallery with', galleryImages.length, 'images');

  displayGalleryImage(0);

  nextBtn.addEventListener('click', () => {
    currentGalleryIndex = (currentGalleryIndex + 1) % galleryImages.length;
    displayGalleryImage(currentGalleryIndex);
    restartAutoPlay();
  });

  prevBtn.addEventListener('click', () => {
    currentGalleryIndex = (currentGalleryIndex - 1 + galleryImages.length) % galleryImages.length;
    displayGalleryImage(currentGalleryIndex);
    restartAutoPlay();
  });

  // Start auto-play
  startAutoPlay();
}

function startAutoPlay() {
  galleryAutoPlayInterval = setInterval(() => {
    currentGalleryIndex = (currentGalleryIndex + 1) % galleryImages.length;
    displayGalleryImage(currentGalleryIndex);
  }, 1000);
}

function restartAutoPlay() {
  clearInterval(galleryAutoPlayInterval);
  startAutoPlay();
}

function displayGalleryImage(index) {
  const galleryGrid = document.getElementById('gallery-grid');
  const counter = document.getElementById('gallery-counter');

  if (!galleryGrid) {
    console.error('Gallery grid not found');
    return;
  }

  galleryGrid.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'gallery-image-wrapper';

  const img = document.createElement('img');
  img.alt = `Memory ${index + 1}`;
  resolveDirectImage(img, galleryImages[index]);

  wrapper.appendChild(img);
  galleryGrid.appendChild(wrapper);

  if (counter) {
    counter.textContent = `${index + 1} / ${galleryImages.length}`;
  }
}

// --- WISHES CARD BACKGROUND SLIDESHOW ---
let wishesBackgrounds = [];

function updateWishesBackground(index) {
  if (wishesBackgrounds.length === 0) return;
  const wishesSection = document.getElementById('wishes-section');
  if (!wishesSection) return;
  
  const bgUrl = wishesBackgrounds[index % wishesBackgrounds.length];
  
  let bgLayer1 = wishesSection.querySelector('.wishes-bg-layer-1');
  let bgLayer2 = wishesSection.querySelector('.wishes-bg-layer-2');
  
  if (!bgLayer1) {
    bgLayer1 = document.createElement('div');
    bgLayer1.className = 'wishes-bg-layer-1';
    bgLayer1.style.backgroundImage = `linear-gradient(rgba(10, 3, 18, 0.82), rgba(22, 10, 40, 0.88)), url('${bgUrl}')`;
    bgLayer1.style.opacity = '1';
    bgLayer1.style.zIndex = '1';
    wishesSection.insertBefore(bgLayer1, wishesSection.firstChild);
    return;
  }
  
  if (!bgLayer2) {
    bgLayer2 = document.createElement('div');
    bgLayer2.className = 'wishes-bg-layer-2';
    bgLayer2.style.opacity = '0';
    bgLayer2.style.zIndex = '0';
    wishesSection.insertBefore(bgLayer2, wishesSection.firstChild);
  }
  
  const gradient = 'linear-gradient(rgba(10, 3, 18, 0.82), rgba(22, 10, 40, 0.88))';
  
  if (bgLayer1.style.opacity === '1' || bgLayer1.style.opacity === '') {
    bgLayer2.style.backgroundImage = `${gradient}, url('${bgUrl}')`;
    bgLayer2.style.opacity = '1';
    bgLayer2.style.zIndex = '2';
    bgLayer1.style.opacity = '0';
    bgLayer1.style.zIndex = '1';
  } else {
    bgLayer1.style.backgroundImage = `${gradient}, url('${bgUrl}')`;
    bgLayer1.style.opacity = '1';
    bgLayer1.style.zIndex = '2';
    bgLayer2.style.opacity = '0';
    bgLayer2.style.zIndex = '1';
  }
}

function initWishesBackgroundSlideshow() {
  const candidates = [
    'photos.pdf/WhatsApp Image 2026-06-07 at 11.09.57 PM.jpeg',
    'photos/WhatsApp Image 2026-06-07 at 11.09.57 PM.jpeg',
    'https://patient-meadow-22.linkyhost.com',
    'https://spring-night-245.linkyhost.com',
    'https://little-pond-461.linkyhost.com'
  ];
  
  let checkedCount = 0;
  candidates.forEach(url => {
    const img = new Image();
    img.onload = function () {
      if (!wishesBackgrounds.includes(url)) {
        wishesBackgrounds.push(url);
      }
      checkedCount++;
      if (wishesBackgrounds.length === 1) {
        updateWishesBackground(0);
      }
    };
    img.onerror = function () {
      checkedCount++;
    };
    img.src = url;
  });
}

// --- INITIALIZATION ---
window.addEventListener('DOMContentLoaded', () => {
  // Resolve all carousel images to direct URLs dynamically
  document.querySelectorAll('#photos-carousel img').forEach(img => {
    const originalUrl = img.getAttribute('src');
    if (originalUrl) {
      resolveDirectImage(img, originalUrl);
    }
  });

  // Start background preloader for Wishes Card
  initWishesBackgroundSlideshow();

  initBackgroundCanvas();
  initConfettiCanvas();
  setupCarousel('#photos-carousel', 800);
  setupCarousel('#wishes-carousel', 5000, (index) => {
    updateWishesBackground(index);
  });
  initGallery();
  initPartyPopper();

  window.addEventListener('resize', () => {
    resizeCanvas(document.getElementById('bg-canvas'));
  });

  console.log('Wishes page loaded successfully');
});
