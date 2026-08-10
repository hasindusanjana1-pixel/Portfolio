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
