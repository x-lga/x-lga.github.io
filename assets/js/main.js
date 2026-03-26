
'use strict';

/* ─── EMAIL OBFUSCATION (bot protection) ─────────────────────────────────
   The email address is never written in plain text in the HTML source.
   Scrapers reading the HTML or CSS will not find it.
   It is assembled at runtime in JavaScript only.
   ──────────────────────────────────────────────────────────────────────── */
(function buildEmail() {
  // Split into parts — bots look for @domain.tld patterns in source
  // Replace these three variables with your actual email parts
  const user   = 'lga.it';    
  const domain = 'proton';                   
  const tld    = 'me';                     

  const address = `${user}@${domain}.${tld}`;

  // Populate the display span
  const display = document.getElementById('email-display');
  if (display) {
    display.textContent = address;
  }

  // Wire up the email button
  const btn = document.getElementById('email-btn');
  if (btn) {
    btn.href = `mailto:${address}`;
  }
})();


/* ─── NAV — add .scrolled class after 60px ──────────────────────────────
   Triggers the frosted glass background on scroll
   ──────────────────────────────────────────────────────────────────────── */
(function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  function onScroll() {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run on load
})();


/* ─── SMOOTH NAV LINK SCROLL ────────────────────────────────────────────
   Intercept nav anchor clicks for smooth scroll with offset
   ──────────────────────────────────────────────────────────────────────── */
(function initSmoothScroll() {
  const navLinks = document.querySelectorAll('.nav-links a, .hero-cta a');

  navLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('mailto')) return;
      if (!href.startsWith('#')) return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      const navHeight = 64;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ─── SCROLL REVEAL ─────────────────────────────────────────────────────
   Elements with class .reveal animate in when they enter the viewport.
   Applied to section titles, cards, stats, and cert items.
   ──────────────────────────────────────────────────────────────────────── */
(function initReveal() {
  const elements = document.querySelectorAll(
    '.section-label, .section-title, .about-text p, .about-stats, ' +
    '.about-terminal, .stack-category, .project-card, ' +
    '.cert-item, .contact-left, .contact-card'
  );

  elements.forEach(el => el.classList.add('reveal'));

  if (!('IntersectionObserver' in window)) {
    // Fallback: just show everything
    elements.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  elements.forEach(el => observer.observe(el));
})();


/* ─── STAGGERED CARD ANIMATION ──────────────────────────────────────────
   Project cards and stack categories animate in with a stagger delay
   ──────────────────────────────────────────────────────────────────────── */
(function initStagger() {
  const groups = [
    { selector: '.project-card',    delay: 80  },
    { selector: '.stack-category',  delay: 60  },
    { selector: '.cert-item',       delay: 50  },
    { selector: '.about-stats .stat', delay: 80 },
  ];

  groups.forEach(({ selector, delay }) => {
    const items = document.querySelectorAll(selector);
    items.forEach((item, i) => {
      item.style.transitionDelay = `${i * delay}ms`;
    });
  });
})();


/* ─── TERMINAL TYPEWRITER ───────────────────────────────────────────────
   Adds a subtle typewriter effect to the terminal body lines
   when the terminal scrolls into view
   ──────────────────────────────────────────────────────────────────────── */
(function initTerminal() {
  const terminal = document.querySelector('.about-terminal');
  if (!terminal) return;

  const lines = terminal.querySelectorAll('.t-line');

  // Initially hide all lines except the first
  lines.forEach((line, i) => {
    if (i > 0) {
      line.style.opacity = '0';
      line.style.transform = 'translateX(-8px)';
      line.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
    }
  });

  let started = false;

  function animateLines() {
    if (started) return;
    started = true;

    lines.forEach((line, i) => {
      if (i === 0) return;
      setTimeout(() => {
        line.style.opacity = '1';
        line.style.transform = 'translateX(0)';
      }, i * 55);
    });
  }

  if (!('IntersectionObserver' in window)) {
    animateLines();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateLines();
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  observer.observe(terminal);
})();


/* ─── ACTIVE NAV LINK HIGHLIGHT ─────────────────────────────────────────
   Highlights the correct nav link based on scroll position
   ──────────────────────────────────────────────────────────────────────── */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  if (!sections.length || !navLinks.length) return;

  function updateActive() {
    const scrollY = window.scrollY + 80;
    let current = '';

    sections.forEach(section => {
      if (section.offsetTop <= scrollY) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.style.color = '';
      const href = link.getAttribute('href');
      if (href === `#${current}`) {
        link.style.color = 'var(--text)';
      }
    });
  }

  window.addEventListener('scroll', updateActive, { passive: true });
  updateActive();
})();


/* ─── STACK ITEM HOVER RIPPLE ───────────────────────────────────────────
   Adds a subtle click/tap ripple on stack items
   ──────────────────────────────────────────────────────────────────────── */
(function initStackRipple() {
  const items = document.querySelectorAll('.stack-item');

  items.forEach(item => {
    item.addEventListener('mouseenter', function () {
      this.style.transform = 'scale(1.04)';
    });
    item.addEventListener('mouseleave', function () {
      this.style.transform = 'scale(1)';
    });
  });
})();


/* ─── HERO PARALLAX (subtle) ────────────────────────────────────────────
   The large background text moves slightly on scroll for depth
   ──────────────────────────────────────────────────────────────────────── */
(function initParallax() {
  const bgText = document.querySelector('.hero-bg-text');
  if (!bgText) return;

  // Only run on non-mobile to avoid performance issues
  if (window.matchMedia('(max-width: 768px)').matches) return;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    bgText.style.transform = `translate(-50%, calc(-50% + ${y * 0.18}px))`;
  }, { passive: true });
})();


/* ─── PAGE LOAD — remove loading state ──────────────────────────────────
   Ensures the page is fully interactive before showing content
   ──────────────────────────────────────────────────────────────────────── */
window.addEventListener('DOMContentLoaded', () => {
  document.body.style.visibility = 'visible';
});
