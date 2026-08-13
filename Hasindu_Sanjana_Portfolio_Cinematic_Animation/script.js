const menu = document.querySelector('.menu');
const links = document.querySelector('.nav-links');
const navLinks = [...document.querySelectorAll('.nav-links a')];

menu.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
});

navLinks.forEach(a => a.addEventListener('click', () => links.classList.remove('open')));

document.getElementById('year').textContent = new Date().getFullYear();

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Scroll progress + active navigation + back-to-top.
const progress = document.querySelector('.scroll-progress span');
const backToTop = document.getElementById('back-to-top');
const sections = [...document.querySelectorAll('main section[id]')];

function updateScrollUI() {
  const scrollTop = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${max > 0 ? (scrollTop / max) * 100 : 0}%`;

  backToTop.classList.toggle('show', scrollTop > 500);

  let current = 'home';
  sections.forEach(section => {
    if (scrollTop >= section.offsetTop - 170) current = section.id;
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
}
window.addEventListener('scroll', updateScrollUI, { passive: true });
updateScrollUI();

backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// Animated hero counters.
let countersStarted = false;
const stats = document.querySelector('.hero-stats');
const counterObserver = new IntersectionObserver(entries => {
  if (!entries[0].isIntersecting || countersStarted) return;
  countersStarted = true;

  document.querySelectorAll('.counter').forEach(counter => {
    const target = Number(counter.dataset.target);
    const suffix = counter.dataset.suffix || '';
    const start = performance.now();
    const duration = 900;

    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      counter.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}, { threshold: 0.5 });
if (stats) counterObserver.observe(stats);

// Rotating typewriter: write -> pause -> erase -> next phrase.
const typing = document.getElementById('typing-text');
const typingPhrases = [
  'building modern web experiences.',
  'turning ideas into practical solutions.',
  'learning new technologies.',
  'solving problems with clean code.',
  'creating simple and useful interfaces.'
];

if (typing) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reducedMotion) {
    typing.textContent = typingPhrases[0];
  } else {
    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function typeLoop() {
      const phrase = typingPhrases[phraseIndex];

      if (!deleting) {
        charIndex++;
        typing.textContent = phrase.slice(0, charIndex);

        if (charIndex === phrase.length) {
          deleting = true;
          setTimeout(typeLoop, 1450);
          return;
        }

        setTimeout(typeLoop, 48);
      } else {
        charIndex--;
        typing.textContent = phrase.slice(0, charIndex);

        if (charIndex === 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % typingPhrases.length;
          setTimeout(typeLoop, 300);
          return;
        }

        setTimeout(typeLoop, 28);
      }
    }

    typeLoop();
  }
}

// Animate skill percentage bars when the skill section enters view.
const skillItems = document.querySelectorAll('.skill-item');
const skillsSection = document.getElementById('skills');

skillItems.forEach(item => {
  item.style.setProperty('--level', `${item.dataset.level}%`);
});

if (skillsSection) {
  const skillObserver = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;

    skillItems.forEach((item, index) => {
      setTimeout(() => item.classList.add('animate'), index * 80);
    });

    skillObserver.disconnect();
  }, { threshold: 0.2 });

  skillObserver.observe(skillsSection);
}

// Interactive project-card tilt on pointer devices.
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
if (canHover) {
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      const rx = (0.5 - y) * 6;
      const ry = (x - 0.5) * 8;

      card.style.setProperty('--mx', `${x * 100}%`);
      card.style.setProperty('--my', `${y * 100}%`);
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
    });

    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  });

  // Gentle mouse-follow glow on desktop.
  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);
  window.addEventListener('pointermove', e => {
    glow.style.left = `${e.clientX}px`;
    glow.style.top = `${e.clientY}px`;
  }, { passive: true });
}

// Close mobile menu when clicking outside.
document.addEventListener('click', e => {
  if (!links.contains(e.target) && !menu.contains(e.target)) links.classList.remove('open');
});


// Occasional subtle cyberpunk flicker on the logo.
const logo = document.querySelector('.logo');
if (logo && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  setInterval(() => {
    logo.classList.add('punk-flicker');
    setTimeout(() => logo.classList.remove('punk-flicker'), 120);
  }, 5200);
}


// Contact form: GitHub Pages is static, so compose the email using the visitor's mail app.
const contactForm = document.getElementById('contact-form');
const contactStatus = document.getElementById('contact-status');
if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const subject = document.getElementById('contact-subject').value.trim();
    const message = document.getElementById('contact-message').value.trim();

    if (!name || !email || !subject || !message) {
      contactStatus.textContent = 'Please complete all fields before sending.';
      contactStatus.className = 'contact-status error';
      return;
    }

    const body = `Hi Hasindu,\n\n${message}\n\nFrom: ${name}\nEmail: ${email}`;
    const mailto = `mailto:hasindusanjana1@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    contactStatus.textContent = 'Opening your email app…';
    contactStatus.className = 'contact-status success';
    window.location.href = mailto;
  });
}


// ======================================================
// Cinematic scroll experience
// ======================================================

const cinematicSections = document.querySelectorAll('main > section');

cinematicSections.forEach(section => {
  if (section.id !== 'home') section.classList.add('cinematic-reveal');
});

const cinematicObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('cinematic-show');
    }
  });
}, {
  threshold: 0.18,
  rootMargin: '0px 0px -8% 0px'
});

cinematicSections.forEach(section => {
  if (section.id !== 'home') cinematicObserver.observe(section);
});

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reduceMotion) {
  const hero = document.querySelector('.hero');
  const heroCopy = document.querySelector('.hero-copy');
  const heroArt = document.querySelector('.hero-art');
  const profilePhoto = document.querySelector('.profile-photo-wrap');
  const beamA = document.querySelector('.beam-a');
  const beamB = document.querySelector('.beam-b');
  const beamC = document.querySelector('.beam-c');

  let ticking = false;

  function cinematicScroll() {
    const y = window.scrollY;
    const vh = window.innerHeight;
    const heroProgress = Math.min(y / Math.max(vh, 1), 1);

    if (heroCopy && y < vh * 1.2) {
      heroCopy.style.transform = `translate3d(0, ${y * 0.16}px, 0)`;
      heroCopy.style.opacity = String(1 - heroProgress * .72);
    }

    if (heroArt && y < vh * 1.2) {
      heroArt.style.transform = `translate3d(0, ${y * -0.07}px, 0) scale(${1 + heroProgress * .035})`;
      heroArt.style.opacity = String(1 - heroProgress * .38);
    }

    if (profilePhoto && y < vh * 1.2) {
      profilePhoto.style.transform = `rotate(${1.2 + heroProgress * 1.1}deg) translate3d(0, ${heroProgress * -12}px, 0)`;
    }

    if (beamA) beamA.style.transform = `translate3d(0, ${y * .055}px, 0) rotate(18deg)`;
    if (beamB) beamB.style.transform = `translate3d(0, ${y * -.035}px, 0) rotate(-16deg)`;
    if (beamC) beamC.style.transform = `translate3d(${Math.sin(y / 600) * 24}px, ${y * -.02}px, 0) rotate(12deg)`;

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(cinematicScroll);
      ticking = true;
    }
  }, { passive: true });

  cinematicScroll();

  // Tiny pointer depth effect for the hero image.
  if (hero && heroArt && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    hero.addEventListener('pointermove', e => {
      if (window.scrollY > window.innerHeight * .85) return;

      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - .5;
      const y = (e.clientY - rect.top) / rect.height - .5;

      heroArt.style.rotate = `${x * 2.2}deg`;
      if (profilePhoto) {
        profilePhoto.style.translate = `${x * 8}px ${y * 7}px`;
      }
    });

    hero.addEventListener('pointerleave', () => {
      heroArt.style.rotate = '';
      if (profilePhoto) profilePhoto.style.translate = '';
    });
  }
}
