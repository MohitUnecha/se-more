/* ============================================
   SE:MORE — Interactive Scripts
   Gulf Blue + British Racing Green Edition
   ============================================ */

// Use a configured backend when available, the local server in development,
// and a local knowledge fallback everywhere else.
const SEMORE_API_BASE = (() => {
  const configuredBase = window.SEMORE_CONFIG?.apiBase || window.SEMORE_CONFIG?.API_BASE || '';
  if (configuredBase) {
    return configuredBase.replace(/\/$/, '');
  }

  if (['localhost', '127.0.0.1'].includes(window.location.hostname)) {
    return window.location.origin;
  }

  return '';
})();

document.addEventListener('DOMContentLoaded', () => {
  const escapeHtml = (text) => text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  // ── Page Loader + Eye Zoom Intro ─────────
  const loader = document.getElementById('pageLoader');
  const eyeOverlay = document.getElementById('eyeZoomOverlay');

  // Skip intro if already played this session (e.g. returning from subpages)
  const introPlayed = sessionStorage.getItem('semore-intro-played');
  const isSubpage = !eyeOverlay || eyeOverlay.style.display === 'none';

  if (introPlayed || isSubpage) {
    if (loader) loader.style.display = 'none';
    if (eyeOverlay) eyeOverlay.style.display = 'none';
    document.body.classList.add('page-ready');
  } else {
    window.addEventListener('load', () => {
      setTimeout(() => {
        loader.classList.add('loaded');
        eyeOverlay.classList.add('active');

        // Phase 1: Eyes appear (entrance animation in CSS)
        // Phase 2: Pupils "look around" tracking cursor
        setTimeout(() => {
          eyeOverlay.classList.add('looking');
        }, 600);

        // Phase 3: Natural blink
        setTimeout(() => {
          eyeOverlay.classList.add('blink');
        }, 1400);

        // Phase 4: Blink ends, pupils dilate, then cinematic zoom
        setTimeout(() => {
          eyeOverlay.classList.remove('blink');
          eyeOverlay.classList.add('dilate');
        }, 1600);

        setTimeout(() => {
          eyeOverlay.classList.add('expanding');

          setTimeout(() => {
            eyeOverlay.classList.add('done');
            loader.style.display = 'none';
            document.body.classList.add('page-ready');
            sessionStorage.setItem('semore-intro-played', '1');
          }, 1200);
        }, 1900);
      }, 300);
    });
  }

  // ── Theme Toggle ──────────────────────────
  const themeToggle = document.getElementById('themeToggle');
  const html = document.documentElement;

  const savedTheme = localStorage.getItem('semore-theme');
  if (savedTheme) {
    html.setAttribute('data-theme', savedTheme);
  }

  themeToggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('semore-theme', next);
  });

  // ── Navbar Scroll ─────────────────────────
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });

  // ── Mobile Menu ───────────────────────────
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  const setMobileMenuState = (isOpen) => {
    hamburger.classList.toggle('active', isOpen);
    navLinks.classList.toggle('mobile-open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
    document.body.classList.toggle('mobile-menu-open', isOpen);
  };

  hamburger.addEventListener('click', () => {
    const isOpen = !navLinks.classList.contains('mobile-open');
    setMobileMenuState(isOpen);
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      setMobileMenuState(false);
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && navLinks.classList.contains('mobile-open')) {
      setMobileMenuState(false);
    }
  });

  // ── Global Cursor Tracking ────────────────
  let cursorX = window.innerWidth / 2;
  let cursorY = window.innerHeight / 2;

  document.addEventListener('mousemove', (e) => {
    cursorX = e.clientX;
    cursorY = e.clientY;
  });

  // ── Custom Cursor ─────────────────────────
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');
  const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
  const hasCustomCursor = hasFinePointer && !!cursorDot && !!cursorRing;
  let ringX = window.innerWidth / 2;
  let ringY = window.innerHeight / 2;

  function animateCursor() {
    if (cursorDot) {
      cursorDot.style.left = cursorX + 'px';
      cursorDot.style.top = cursorY + 'px';
    }
    ringX += (cursorX - ringX) * 0.12;
    ringY += (cursorY - ringY) * 0.12;
    if (cursorRing) {
      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top = ringY + 'px';
    }
    requestAnimationFrame(animateCursor);
  }

  if (hasCustomCursor) {
    document.body.classList.add('custom-cursor-enabled');
    animateCursor();
    const hoverTargets = document.querySelectorAll('a, button, .service-card, .why-card, .founder-card, .result-card, [data-tilt]');
    hoverTargets.forEach(el => {
      el.addEventListener('mouseenter', () => cursorRing && cursorRing.classList.add('hovering'));
      el.addEventListener('mouseleave', () => cursorRing && cursorRing.classList.remove('hovering'));
    });
  } else {
    document.body.classList.remove('custom-cursor-enabled');
    if (cursorDot) cursorDot.style.display = 'none';
    if (cursorRing) cursorRing.style.display = 'none';
  }

  // ── Cursor-Tracking Eyes ──────────────────
  function trackEyes() {
    const pupils = document.querySelectorAll('.logo-colon .eye .pupil');
    pupils.forEach(pupil => {
      const eye = pupil.parentElement;
      const rect = eye.getBoundingClientRect();
      const eyeCenterX = rect.left + rect.width / 2;
      const eyeCenterY = rect.top + rect.height / 2;

      const dx = cursorX - eyeCenterX;
      const dy = cursorY - eyeCenterY;
      const angle = Math.atan2(dy, dx);
      const dist = Math.min(Math.hypot(dx, dy), rect.width * 3);

      const maxTravel = rect.width * 0.3;
      const travel = (dist / (rect.width * 3)) * maxTravel;

      const px = Math.cos(angle) * travel;
      const py = Math.sin(angle) * travel;

      pupil.style.transform = `translate(calc(-50% + ${px}px), calc(-50% + ${py}px))`;
    });

    const irises = document.querySelectorAll('.scanner-eye .iris');
    irises.forEach(iris => {
      const eye = iris.parentElement;
      const rect = eye.getBoundingClientRect();
      const eyeCenterX = rect.left + rect.width / 2;
      const eyeCenterY = rect.top + rect.height / 2;

      const dx = cursorX - eyeCenterX;
      const dy = cursorY - eyeCenterY;
      const angle = Math.atan2(dy, dx);
      const dist = Math.min(Math.hypot(dx, dy), 400);

      const maxTravel = 10;
      const travel = (dist / 400) * maxTravel;

      const px = Math.cos(angle) * travel;
      const py = Math.sin(angle) * travel;

      iris.style.transform = `translate(${px}px, ${py}px)`;
    });

    requestAnimationFrame(trackEyes);
  }

  trackEyes();

  // ── Particle Canvas ───────────────────────
  const canvas = document.getElementById('particleCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    const PARTICLE_COUNT = 60;

    function resizeCanvas() {
      const hero = canvas.parentElement;
      canvas.width = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4;
        this.opacity = Math.random() * 0.4 + 0.1;
        // Random color between gulf blue and brg green
        this.hue = Math.random() > 0.5 ? '160' : '200';
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Subtle attraction to cursor
        const heroRect = canvas.getBoundingClientRect();
        const localCursorX = cursorX - heroRect.left;
        const localCursorY = cursorY - heroRect.top;
        const dx = localCursorX - this.x;
        const dy = localCursorY - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 200 && dist > 0) {
          this.x += (dx / dist) * 0.3;
          this.y += (dy / dist) * 0.3;
        }

        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }
      draw() {
        const isDark = html.getAttribute('data-theme') === 'dark';
        const lightness = isDark ? '65%' : '40%';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 80%, ${lightness}, ${this.opacity})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }

    function drawLines() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist < 120) {
            const isDark = html.getAttribute('data-theme') === 'dark';
            const lineColor = isDark ? `rgba(125, 204, 248, ${0.06 * (1 - dist / 120)})` : `rgba(0, 77, 43, ${0.08 * (1 - dist / 120)})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      drawLines();
      requestAnimationFrame(animateParticles);
    }

    animateParticles();
  }

  // ── Typed Text Effect ─────────────────────
  const typedEl = document.getElementById('typedText');
  if (typedEl) {
    const words = [
      'Possibilities',
      'Opportunities',
      'Efficiency',
      'Profitability',
      'Growth',
      'Clarity',
      'Potential'
    ];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100;

    function typeLoop() {
      const currentWord = words[wordIndex];

      if (isDeleting) {
        typedEl.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
        typeSpeed = 50;
      } else {
        typedEl.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
        typeSpeed = 100;
      }

      if (!isDeleting && charIndex === currentWord.length) {
        typeSpeed = 2000; // Pause at full word
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        typeSpeed = 400; // Brief pause before new word
      }

      setTimeout(typeLoop, typeSpeed);
    }

    setTimeout(typeLoop, 800);
  }

  // ── 3D Tilt Cards ─────────────────────────
  const tiltCards = document.querySelectorAll('[data-tilt]');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;

      // Update shine position
      const shine = card.querySelector('.card-shine');
      if (shine) {
        shine.style.setProperty('--mouse-x', x + 'px');
        shine.style.setProperty('--mouse-y', y + 'px');
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s ease';
      setTimeout(() => { card.style.transition = ''; }, 500);
    });
  });

  // ── Visionary Orbit 3D Physics ────────────
  const orbitPacks = document.querySelectorAll('.founder-card');
  orbitPacks.forEach(pack => {
    const orbit = pack.querySelector('.orbit-container');
    if (!orbit) return;

    pack.addEventListener('mousemove', (e) => {
      const rect = pack.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate dramatic 3D angles
      const rotateX = ((y - centerY) / centerY) * -35;
      const rotateY = ((x - centerX) / centerX) * 35;

      orbit.style.transform = `translate(-50%, -50%) perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      orbit.style.transition = 'transform 0.1s ease-out';
    });

    pack.addEventListener('mouseleave', () => {
      orbit.style.transform = 'translate(-50%, -50%) perspective(1000px) rotateX(0deg) rotateY(0deg)';
      orbit.style.transition = 'transform 1s cubic-bezier(0.23, 1, 0.32, 1)';
    });
  });

  // ── Magnetic Buttons ──────────────────────
  document.querySelectorAll('.btn, .cta-btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const bx = rect.left + rect.width / 2;
      const by = rect.top + rect.height / 2;
      btn.style.transform = `translate(${(e.clientX - bx) * 0.15}px, ${(e.clientY - by) * 0.15}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
      btn.style.transition = 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)';
      setTimeout(() => { btn.style.transition = ''; }, 400);
    });
  });

  // ── Stat Counter Animation ────────────────
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'));
    const duration = 2000;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased);

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  // ── Intersection Observers ────────────────
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        statNumbers.forEach(el => animateCounter(el));
        statsObserver.disconnect();
      }
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -50px 0px' });

  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) {
    statsObserver.observe(heroStats);
  }

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.step, [data-aos]').forEach(el => {
    revealObserver.observe(el);
  });

  // Service cards stagger
  const serviceCards = document.querySelectorAll('.service-card');
  const serviceObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, i * 120);
      }
    });
  }, { threshold: 0.15 });

  serviceCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    serviceObserver.observe(card);
  });

  const style = document.createElement('style');
  style.textContent = `.service-card.visible { opacity: 1 !important; }
.service-card.visible:not(:hover) { transform: translateY(0) !important; }`;
  document.head.appendChild(style);

  // ── Smooth Scroll for Anchor Links ────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') {
        return;
      }

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ── Contact Form — mailto ──────────────────
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');
  const bookingPathGrid = document.getElementById('bookingPathGrid');
  const servicePathInput = document.getElementById('servicePath');
  const bookingRouteTitle = document.getElementById('bookingRouteTitle');
  const bookingRouteText = document.getElementById('bookingRouteText');
  const timelineInput = document.getElementById('timeline');

  const bookingRoutes = {
    automation: {
      title: 'Automation Discovery Call',
      text: 'Best for businesses losing time to repetitive admin, manual reporting, disconnected approvals, or operational copy-paste work.',
      subject: 'Automation Discovery Call',
      intro: 'We want to streamline repetitive workflows and remove manual operational work.'
    },
    ai: {
      title: 'AI Integration Strategy Call',
      text: 'Best for teams that need AI copilots, support deflection, document understanding, internal search, or smarter recommendations.',
      subject: 'AI Integration Strategy Call',
      intro: 'We want to explore practical AI use cases inside our existing systems.'
    },
    modernization: {
      title: 'System Modernization Call',
      text: 'Best for businesses held back by legacy software, spreadsheets, outdated tooling, or disconnected internal systems.',
      subject: 'System Modernization Call',
      intro: 'We need to modernize legacy systems without disrupting the business.'
    },
    strategy: {
      title: 'Technology Roadmap Call',
      text: 'Best when you need an objective roadmap before committing to vendors, tools, architecture, or custom development.',
      subject: 'Technology Roadmap Call',
      intro: 'We need strategic guidance on where to invest in technology next.'
    }
  };

  function applyBookingRoute(routeKey) {
    const route = bookingRoutes[routeKey];
    if (!route) {
      return;
    }

    if (servicePathInput) {
      servicePathInput.value = routeKey;
    }
    if (bookingRouteTitle) {
      bookingRouteTitle.textContent = route.title;
    }
    if (bookingRouteText) {
      bookingRouteText.textContent = route.text;
    }
  }

  if (bookingPathGrid) {
    bookingPathGrid.querySelectorAll('.booking-path').forEach(button => {
      button.addEventListener('click', () => {
        bookingPathGrid.querySelectorAll('.booking-path').forEach(path => path.classList.remove('active'));
        button.classList.add('active');
        applyBookingRoute(button.dataset.path);
      });
    });
  }

  if (contactForm && formSuccess) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = contactForm.querySelector('#name')?.value || '';
      const email = contactForm.querySelector('#email')?.value || '';
      const company = contactForm.querySelector('#company')?.value || '';
      const message = contactForm.querySelector('#message')?.value || '';
      const selectedRouteKey = servicePathInput?.value || 'automation';
      const selectedRoute = bookingRoutes[selectedRouteKey] || bookingRoutes.automation;
      const timeline = timelineInput?.value || 'Not specified';

      const subject = encodeURIComponent(`${selectedRoute.subject} — ${name} — ${company || 'N/A'}`);
      const body = encodeURIComponent(
        `Consultation Type: ${selectedRoute.title}\nName: ${name}\nEmail: ${email}\nCompany: ${company || 'N/A'}\nDesired Timeline: ${timeline}\n\nWhy we are reaching out:\n${selectedRoute.intro}\n\nCurrent bottleneck:\n${message}\n\nNext step requested:\nPlease route us to the best SE:MORE consultation path for this need.`
      );

      window.open(`mailto:contact@semore.tech?subject=${subject}&body=${body}`, '_self');

      const btn = contactForm.querySelector('button[type="submit"]');
      if (!btn) {
        return;
      }

      btn.innerHTML = '<span>Opening email...</span>';
      btn.disabled = true;

      setTimeout(() => {
        contactForm.querySelectorAll('.form-group').forEach(g => g.style.display = 'none');
        btn.style.display = 'none';
        formSuccess.classList.add('visible');
        contactForm.reset();
      }, 1500);
    });
  }

  // ── Parallax Floating Shapes ──────────────
  function animateShapes() {
    const normX = (cursorX / window.innerWidth - 0.5) * 2;
    const normY = (cursorY / window.innerHeight - 0.5) * 2;

    const shapes = document.querySelectorAll('.floating-shape');
    shapes.forEach((shape, i) => {
      const speed = (i + 1) * 12;
      const x = normX * speed;
      const y = normY * speed;
      shape.style.transform = `translate(${x}px, ${y}px)`;
    });
    requestAnimationFrame(animateShapes);
  }

  animateShapes();

  // ── Active Nav Link Highlight ─────────────
  const sections = document.querySelectorAll('.section[id], .hero[id]');
  const navLinksAll = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - 100;
      if (window.scrollY >= top) {
        current = section.getAttribute('id');
      }
    });

    navLinksAll.forEach(link => {
      link.style.color = '';
      if (link.getAttribute('href') === '#' + current) {
        link.style.color = 'var(--brg-glow)';
      }
    });
  });

  // ── Groq AI Chat Widget ───────────────────
  // API calls are proxied through /api/chat when a backend is configured.
  // If no backend is available, the site falls back to a local sales assistant
  // so the chat still works for demos and common client questions.

  const LOCAL_ASSISTANT_RESPONSES = [
    {
      keywords: ['service', 'services', 'offer', 'help', 'do you do'],
      reply: 'SE:MORE focuses on four core offers: workflow automation, AI integration, system modernization, and technology consulting. If you want, I can break down which one fits your business based on your biggest bottleneck.'
    },
    {
      keywords: ['automation', 'manual', 'repetitive', 'copy', 'busywork'],
      reply: 'Workflow automation is ideal when your team is spending hours on invoices, CRM updates, report generation, approvals, or repetitive follow-ups. SE:MORE usually starts by mapping the highest-friction workflow, then automates the handoffs so your team gets time back immediately.'
    },
    {
      keywords: ['ai', 'chatbot', 'assistant', 'support', 'documents'],
      reply: 'AI integration is best when you want faster support, smarter document handling, internal search, or data-driven recommendations without replacing your existing stack. SE:MORE can embed AI into the tools you already use and measure the impact against clear KPIs.'
    },
    {
      keywords: ['legacy', 'modernize', 'modernization', 'old system', 'outdated'],
      reply: 'System modernization is for businesses stuck with fragile spreadsheets, legacy databases, desktop tools, or systems that do not talk to each other. SE:MORE upgrades what is slowing you down without forcing a risky rip-and-replace project.'
    },
    {
      keywords: ['consulting', 'roadmap', 'strategy', 'advice', 'plan'],
      reply: 'Technology consulting is the right fit when you need clarity before you build. SE:MORE helps with audits, build-vs-buy decisions, architecture reviews, vendor selection, and practical technology roadmaps tied to ROI.'
    },
    {
      keywords: ['process', 'how it works', 'how do you work'],
      reply: 'SE:MORE follows a simple three-step model: We See, We Simplify, You Scale. That means discovery first, then a clear solution design, then implementation and optimization with measurable business outcomes.'
    },
    {
      keywords: ['pricing', 'cost', 'quote', 'how much'],
      reply: 'SE:MORE does custom pricing based on scope, complexity, and expected impact. The normal starting point is a free consultation so the team can understand the workflow, estimate ROI, and recommend the right engagement shape.'
    },
    {
      keywords: ['founder', 'founders', 'mohit', 'hitayu', 'team'],
      reply: 'SE:MORE was founded by Mohit Unecha and Hitayu Parikh. Mohit focuses on software engineering, AI integration, and product development, while Hitayu brings strength in technology strategy, operations, and scalable systems.'
    },
    {
      keywords: ['contact', 'email', 'book', 'consultation', 'get started'],
      reply: 'The fastest way to get started is to book a consultation or email contact@semore.tech. If you tell me your biggest bottleneck, I can also suggest which SE:MORE service to lead with in that conversation.'
    },
    {
      keywords: ['location', 'where', 'new jersey'],
      reply: 'SE:MORE is based in Central New Jersey and works remotely with businesses across the United States and beyond. The team can support strategy, implementation, and optimization without requiring a local-only footprint.'
    }
  ];

  const SYSTEM_PROMPT = `You are the SE:MORE AI assistant embedded on the SE:MORE company website. You are knowledgeable, friendly, and concise. Answer questions about the company, its founders, services, location, process, and how it can help businesses.

COMPANY OVERVIEW:
SE:MORE LLC is a technology-enablement company headquartered in Central New Jersey, USA. The company operates remotely and serves businesses across the United States and worldwide. SE:MORE helps businesses see more ways to grow, profit, and operate smarter through targeted technology solutions. The company name "SE:MORE" uses the colon as two eyes, symbolizing vision, clarity, and the ability to see opportunities others miss.
- Email: contact@semore.tech
- Headquarters: Central New Jersey, USA
- Google Maps: https://www.google.com/maps/place/SE:MORE/@40.5857762,-74.376456,15z
- Website: Current page

FOUNDERS:
1. Hitayu Parikh - Co-Founder
   - LinkedIn: https://www.linkedin.com/in/hitayu-parikh/
   - Brings expertise in technology strategy, business operations, and building scalable systems
   - Passionate about translating complex technology into tangible business value
   - Based in New Jersey, USA

2. Mohit Unecha - Co-Founder
   - LinkedIn: https://www.linkedin.com/in/mohitunecha/
   - Brings expertise in software engineering, AI integration, and product development
   - Focused on building practical, results-driven tech solutions for businesses
   - Based in New Jersey, USA

Both founders built SE:MORE from the belief that most businesses already have the data and tools they need - they just need the right partner to help them see and unlock the value hidden within.

SERVICES (4 core offerings):

1. WORKFLOW AUTOMATION
   Eliminate repetitive manual work through smart workflow automation. Save 20+ hours per week, reduce errors by 95%, and see ROI in 30 days.
   What we automate:
   - Invoice & payment processing (auto-match to POs, flag discrepancies, trigger payment runs)
   - CRM data entry (sync contacts, auto-update records, log calls/emails/meetings)
   - Report generation (scheduled, self-building reports delivered on time)
   - Email & notification workflows (onboarding sequences, follow-ups, alerts, escalations)
   - Inventory & order management (real-time sync, low-stock alerts, reorder triggers)
   - Employee onboarding (account provisioning, document routing, training checklists)
   Our process: Discover -> Design -> Build -> Optimize
   Tools: Zapier, Make.com, Python, n8n, Webhooks, REST APIs, Google Workspace, Microsoft 365, Airtable, Notion, Slack, HubSpot, Salesforce, Custom Scripts

2. AI INTEGRATION
   Embed AI into existing business systems without rip-and-replace. 35% reduction in support load, 3x faster data processing.
   What we build:
   - AI chat agents (trained on your products, processes, FAQs)
   - Document understanding (extract, classify, summarize invoices, contracts, reports)
   - Predictive analytics (forecast demand, churn, revenue with ML models)
   - Smart recommendations (next best actions for sales, support, operations)
   - AI-powered search (semantic search with vector embeddings and RAG)
   - Computer vision (quality control, document scanning, visual inspection)
   Our process: Audit -> Select -> Integrate -> Measure
   Tech: OpenAI GPT-4o, Anthropic Claude, Groq Llama, Mistral, LangChain, LlamaIndex, Pinecone, Weaviate, Python, FastAPI, RAG Pipelines, Fine-tuning, Function Calling

3. SYSTEM MODERNIZATION
   Upgrade legacy tech stacks without disruption. Zero big-bang rip-outs, 4-8 week typical sprint, zero downtime migration guarantee.
   What we modernize:
   - Legacy databases (migrate to cloud-native with full data integrity)
   - Desktop apps (transform to web-based, accessible tools)
   - Spreadsheet operations (convert to automated real-time dashboards)
   - On-premise to cloud (AWS, GCP, or Azure migration)
   - API-enable old systems (add REST or GraphQL APIs)
   - Tech debt reduction (refactor without full rewrite)
   Our approach: Assess -> Bridge -> Migrate -> Retire
   Tech: AWS, Google Cloud, Azure, PostgreSQL, MongoDB, Docker, Kubernetes, React, Node.js, FastAPI, GraphQL, REST APIs, Terraform, CI/CD, GitHub Actions

4. TECHNOLOGY CONSULTING
   Strategic technology guidance with measurable ROI. Free initial strategy call, actionable roadmaps, no fluff. 30 days to a clear tech roadmap.
   What we advise on:
   - Technology audit (deep review of stack, costs, capability gaps)
   - Build vs buy analysis (objective assessment of custom vs off-the-shelf)
   - Vendor selection (cut through sales pitches, match tools to needs)
   - Digital roadmap (6-12 month prioritized investment plan with ROI targets)
   - Architecture review (scale, security, cost assessment)
   - Team & process alignment (ensure adoption and execution readiness)
   Engagement: Discovery Call -> Audit Report -> Prioritized Roadmap -> Ongoing Advisory
   Expertise: Cloud Strategy, SaaS Evaluation, AI Strategy, Data Architecture, Security Review, Cost Optimization, Team Scaling, API Design, Product Strategy, MVP Planning, Tech Debt Assessment, Vendor Negotiation, Compliance, Digital Transformation

THE SE:MORE PROCESS (3 steps):
Step 1 - "We See" (Discovery and Clarity): Deep audit of your workflows, tools, data, and pain points. We identify bottlenecks, hidden costs, and untapped opportunities invisible from the inside.
Step 2 - "We Simplify" (Strategy and Solution Design): Clear, actionable technology roadmap with no jargon or fluff. We design solutions tailored to your exact business reality and budget.
Step 3 - "You Scale" (Implementation and Optimization): We build, deploy, and optimize the solution. You receive measurable results - more efficiency, more revenue, more growth. We stay on to iterate.

WHY SE:MORE IS DIFFERENT:
- Insight-driven: Every recommendation is backed by data analysis of your actual operations - no guesswork
- Uses what you already have: We enhance existing tools and systems rather than forcing expensive replacements
- Fast delivery: Working solutions delivered in weeks, not 18-month enterprise timelines
- Measurable results: Every engagement has clear KPIs. If it does not move the needle, we do not do it
- Human-centric: Technology should serve people - we keep solutions simple and trainable
- Small business friendly: We work with businesses of all sizes, not just enterprise clients

PROVEN RESULTS:
- Clients save an average of 20+ hours per week through workflow automation
- 35% average reduction in customer support load via AI integration
- Zero legacy systems needed to be fully replaced - all were streamlined and modernized in place
- Multiple clients have seen ROI within the first 30-60 days of implementation

LOCATION:
SE:MORE is based in Central New Jersey, a hub of business and technology activity between New York City and Philadelphia. The team works remotely and travels to client sites as needed. Central NJ location allows SE:MORE to serve the dense tri-state business ecosystem (NJ, NY, CT) as well as clients nationwide.
Google Maps: https://www.google.com/maps/place/SE:MORE/@40.5857762,-74.376456,15z

INSTRUCTIONS FOR RESPONDING:
- Be friendly, warm, and conversational - not robotic
- Keep responses to 2-3 sentences unless the user asks for detailed information
- If asked about pricing, explain that SE:MORE offers custom quotes based on scope and always start with a free consultation
- If asked about founders, share their LinkedIn URLs and expertise
- If someone wants to get started, direct them to book a free consultation or email contact@semore.tech
- For detailed service questions, reference specific use cases and tools from the service descriptions above
- If the question is unrelated to SE:MORE or business technology, politely redirect`;


  const chatWidget = document.getElementById('chatWidget');
  const chatToggle = document.getElementById('chatToggle');
  const chatWindow = document.getElementById('chatWindow');
  const chatMessages = document.getElementById('chatMessages');
  const chatFormEl = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatSubmit = chatFormEl?.querySelector('button[type="submit"]');
  let isSendingChat = false;

  let chatHistory = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'assistant', content: "Hey! I'm the SE:MORE AI assistant. Ask me anything about our services, how we work, or how we can help your business." }
  ];

  chatToggle.addEventListener('click', () => {
    chatWidget.classList.toggle('open');
    chatToggle.setAttribute('aria-expanded', String(chatWidget.classList.contains('open')));
    if (chatWidget.classList.contains('open')) {
      chatInput.focus();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && chatWidget.classList.contains('open')) {
      chatWidget.classList.remove('open');
      chatToggle.setAttribute('aria-expanded', 'false');
    }
  });

  function addMessage(text, sender) {
    const div = document.createElement('div');
    div.className = `chat-msg ${sender}`;
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    if (sender === 'bot') {
      bubble.innerHTML = formatBotText(text);
    } else {
      bubble.textContent = text;
    }
    div.appendChild(bubble);
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return div;
  }

  function formatBotText(text) {
    let html = escapeHtml(text)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
    html = html.replace(
      /(https?:\/\/[^\s<]+)/g,
      '<a href="$1" target="_blank" rel="noopener" style="color:var(--gulf-blue);text-decoration:underline;">$1</a>'
    );
    html = html.replace(
      /contact@semore\.com/g,
      '<a href="mailto:contact@semore.tech" style="color:var(--gulf-blue);text-decoration:underline;">contact@semore.tech</a>'
    );
    return html;
  }

  function addTypingIndicator() {
    const div = document.createElement('div');
    div.className = 'chat-msg bot';
    div.id = 'typingIndicator';
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble typing';
    bubble.innerHTML = '<span></span><span></span><span></span>';
    div.appendChild(bubble);
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) indicator.remove();
  }

  function setChatPendingState(isPending) {
    isSendingChat = isPending;
    chatWidget.classList.toggle('busy', isPending);
    if (chatInput) {
      chatInput.disabled = isPending;
    }
    if (chatSubmit) {
      chatSubmit.disabled = isPending;
    }
    document.querySelectorAll('.quick-reply').forEach(btn => {
      btn.disabled = isPending;
    });
  }

  function generateLocalAssistantReply(userMessage) {
    const normalized = userMessage.toLowerCase();
    const matchedResponse = LOCAL_ASSISTANT_RESPONSES.find(({ keywords }) =>
      keywords.some(keyword => normalized.includes(keyword))
    );

    if (matchedResponse) {
      return matchedResponse.reply;
    }

    return 'SE:MORE helps businesses grow through workflow automation, AI integration, system modernization, and practical consulting. Tell me the biggest bottleneck in your business and I’ll point you to the best-fit service and next step.';
  }

  async function getAssistantReply(userMessage) {
    if (!SEMORE_API_BASE) {
      return generateLocalAssistantReply(userMessage);
    }

    const response = await fetch(`${SEMORE_API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: chatHistory,
        max_tokens: 300,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;
    if (!reply) {
      throw new Error('Malformed chat response');
    }

    return reply;
  }

  async function sendToGroq(userMessage) {
    if (isSendingChat) {
      return;
    }

    chatHistory.push({ role: 'user', content: userMessage });

    setChatPendingState(true);
    addTypingIndicator();

    try {
      const reply = await getAssistantReply(userMessage);

      removeTypingIndicator();

      chatHistory.push({ role: 'assistant', content: reply });
      addMessage(reply, 'bot');
    } catch (err) {
      removeTypingIndicator();
      const fallbackReply = generateLocalAssistantReply(userMessage);
      chatHistory.push({ role: 'assistant', content: fallbackReply });
      addMessage(fallbackReply, 'bot');
    } finally {
      setChatPendingState(false);
      chatInput?.focus();
    }
  }

  chatFormEl.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = chatInput.value.trim();
    if (!msg) return;

    hideQuickReplies();
    addMessage(msg, 'user');
    chatInput.value = '';
    sendToGroq(msg);
  });

  // Quick reply chips
  const quickReplies = document.getElementById('chatQuickReplies');
  function hideQuickReplies() {
    if (quickReplies) quickReplies.style.display = 'none';
  }

  document.querySelectorAll('.quick-reply').forEach(btn => {
    btn.addEventListener('click', () => {
      const msg = btn.getAttribute('data-msg');
      hideQuickReplies();
      addMessage(msg, 'user');
      sendToGroq(msg);
    });
  });

  // ── Opportunity Scanner ───────────────────
  const scannerSignals = {
    manual: {
      title: 'Workflow Automation',
      text: 'Best when a team is burning hours on repetitive admin, reporting, approvals, and operational follow-ups.',
      impact: '20+ hours back each week',
      action: 'Map one high-friction workflow and automate the handoffs',
      prompt: 'A client says their team spends too much time on repetitive manual work. How would SE:MORE help?'
    },
    support: {
      title: 'AI Integration',
      text: 'Best when support queues, document review, or internal knowledge access are slowing down the business.',
      impact: '35% lighter support load',
      action: 'Deploy an AI assistant or document workflow inside the existing stack',
      prompt: 'A client says their support team is overloaded. How would SE:MORE use AI to help?'
    },
    legacy: {
      title: 'System Modernization',
      text: 'Best when old tools, spreadsheets, or fragile legacy systems are limiting growth and visibility.',
      impact: 'Modernize without rip-and-replace risk',
      action: 'Bridge the legacy system, then phase the new architecture in safely',
      prompt: 'A client is stuck on legacy systems. How would SE:MORE modernize them without disruption?'
    },
    visibility: {
      title: 'Workflow Automation + Reporting',
      text: 'Best when leadership cannot see pipeline health, operations performance, or financial reporting in real time.',
      impact: 'Real-time dashboards instead of delayed reports',
      action: 'Automate data collection and push it into a live reporting layer',
      prompt: 'A client has poor reporting visibility. What would SE:MORE recommend first?'
    },
    handoffs: {
      title: 'Automation + Integration',
      text: 'Best when sales, ops, finance, and support are losing time because information dies between teams.',
      impact: 'Cleaner handoffs and fewer dropped tasks',
      action: 'Connect the systems and automate status movement between them',
      prompt: 'A client has broken cross-team handoffs. How would SE:MORE fix that?'
    },
    strategy: {
      title: 'Technology Consulting',
      text: 'Best when the business needs a clear roadmap before spending money on tools, vendors, or custom builds.',
      impact: 'A prioritized roadmap tied to ROI',
      action: 'Run an audit, rank the opportunities, then sequence execution',
      prompt: 'A client needs a technology roadmap. What does a SE:MORE consulting engagement look like?'
    }
  };

  const signalChipGrid = document.getElementById('signalChipGrid');
  const recommendationTitle = document.getElementById('recommendationTitle');
  const recommendationText = document.getElementById('recommendationText');
  const recommendationImpact = document.getElementById('recommendationImpact');
  const recommendationAction = document.getElementById('recommendationAction');
  const askRecommendationBtn = document.getElementById('askRecommendationBtn');
  let currentRecommendationPrompt = scannerSignals.manual.prompt;

  function applyRecommendation(signalKey) {
    const recommendation = scannerSignals[signalKey];
    if (!recommendation) {
      return;
    }

    recommendationTitle.textContent = recommendation.title;
    recommendationText.textContent = recommendation.text;
    recommendationImpact.textContent = recommendation.impact;
    recommendationAction.textContent = recommendation.action;
    currentRecommendationPrompt = recommendation.prompt;
  }

  if (signalChipGrid) {
    signalChipGrid.querySelectorAll('.signal-chip').forEach(button => {
      button.addEventListener('click', () => {
        signalChipGrid.querySelectorAll('.signal-chip').forEach(chip => chip.classList.remove('active'));
        button.classList.add('active');
        applyRecommendation(button.dataset.signal);
      });
    });
  }

  if (askRecommendationBtn) {
    askRecommendationBtn.addEventListener('click', () => {
      chatWidget.classList.add('open');
      chatToggle.setAttribute('aria-expanded', 'true');
      hideQuickReplies();
      addMessage(currentRecommendationPrompt, 'user');
      sendToGroq(currentRecommendationPrompt);
      chatInput.focus();
    });
  }

  // ── ROI Calculator ────────────────────────
  const roiInputs = {
    employees: document.getElementById('roiEmployees'),
    hours: document.getElementById('roiHours'),
    rate: document.getElementById('roiRate'),
    recovery: document.getElementById('roiRecovery')
  };
  const roiOutputs = {
    employeesValue: document.getElementById('roiEmployeesValue'),
    hoursValue: document.getElementById('roiHoursValue'),
    rateValue: document.getElementById('roiRateValue'),
    recoveryValue: document.getElementById('roiRecoveryValue'),
    monthlyHours: document.getElementById('roiMonthlyHours'),
    annualValue: document.getElementById('roiAnnualValue'),
    quarterValue: document.getElementById('roiQuarterValue'),
    summaryText: document.getElementById('roiSummaryText')
  };

  function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  }

  function updateRoiCalculator() {
    if (!roiInputs.employees || !roiOutputs.employeesValue) {
      return;
    }

    const employees = Number(roiInputs.employees.value);
    const hours = Number(roiInputs.hours.value);
    const rate = Number(roiInputs.rate.value);
    const recovery = Number(roiInputs.recovery.value) / 100;

    const monthlyHoursRecovered = employees * hours * 4 * recovery;
    const annualValue = monthlyHoursRecovered * rate * 12;
    const quarterValue = annualValue / 4;

    roiOutputs.employeesValue.textContent = `${employees} ${employees === 1 ? 'person' : 'people'}`;
    roiOutputs.hoursValue.textContent = `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    roiOutputs.rateValue.textContent = `${formatCurrency(rate)}/hr`;
    roiOutputs.recoveryValue.textContent = `${Math.round(recovery * 100)}%`;
    roiOutputs.monthlyHours.textContent = Math.round(monthlyHoursRecovered).toString();
    roiOutputs.annualValue.textContent = formatCurrency(annualValue);
    roiOutputs.quarterValue.textContent = formatCurrency(quarterValue);
    roiOutputs.summaryText.textContent = `This process is likely burning about ${formatCurrency(quarterValue)} every quarter. That gives SE:MORE a strong business case to automate the workflow, improve visibility, or layer AI into the team’s process.`;
  }

  Object.values(roiInputs).forEach(input => {
    input?.addEventListener('input', updateRoiCalculator);
  });
  updateRoiCalculator();

  // ── Back to Top Button ────────────────────
  const backToTop = document.getElementById('backToTop');

  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.scrollY > 600);
  });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ── Enhanced Scroll Reveal ──────────────
  const revealElements = document.querySelectorAll('.section-header, .about-text, .about-visual, .why-card, .result-card, .cta-inner, .contact-info, .contact-form');
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('reveal-up', 'visible');
        }, i * 80);
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  revealElements.forEach(el => {
    el.classList.add('reveal-up');
    revealObs.observe(el);
  });

  // ── Smooth number count on result cards ──
  const resultMetrics = document.querySelectorAll('.result-metric');
  const metricObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.transition = 'transform 0.5s ease';
        entry.target.style.transform = 'scale(1.05)';
        setTimeout(() => {
          entry.target.style.transform = 'scale(1)';
        }, 500);
        metricObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  resultMetrics.forEach(m => metricObs.observe(m));

  // ── Scroll Progress Bar ───────────────────
  const scrollBar = document.createElement('div');
  scrollBar.style.cssText = 'position:fixed;top:0;left:0;height:2px;width:0%;background:linear-gradient(90deg,var(--gulf-blue),var(--brg-glow));z-index:99999;transition:width 0.1s linear;pointer-events:none;border-radius:0 2px 2px 0;';
  document.body.appendChild(scrollBar);

  window.addEventListener('scroll', () => {
    const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    scrollBar.style.width = Math.min(pct, 100) + '%';
  }, { passive: true });

  // ── Text Scramble on Nav Hover ─────────────
  const scrambleChars = 'SE:MORE>?@#$*+!';
  document.querySelectorAll('.nav-links a').forEach(el => {
    const original = el.textContent;
    let scrambleTimer;
    el.addEventListener('mouseenter', () => {
      let frame = 0;
      clearInterval(scrambleTimer);
      scrambleTimer = setInterval(() => {
        el.textContent = original.split('').map((ch, i) => {
          if (i < frame) return original[i];
          return ch === ' ' ? ' ' : scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
        }).join('');
        frame++;
        if (frame >= original.length) clearInterval(scrambleTimer);
      }, 40);
    });
    el.addEventListener('mouseleave', () => {
      clearInterval(scrambleTimer);
      el.textContent = original;
    });
  });

});
