/* ============================================
   SE:MORE — Interactive Scripts
   Gulf Blue + British Racing Green Edition
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

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

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('mobile-open');
    document.body.style.overflow = navLinks.classList.contains('mobile-open') ? 'hidden' : '';
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('mobile-open');
      document.body.style.overflow = '';
    });
  });

  // ── Global Cursor Tracking ────────────────
  let cursorX = window.innerWidth / 2;
  let cursorY = window.innerHeight / 2;

  document.addEventListener('mousemove', (e) => {
    cursorX = e.clientX;
    cursorY = e.clientY;
  });

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
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 80%, 65%, ${this.opacity})`;
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
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(125, 204, 248, ${0.06 * (1 - dist / 120)})`;
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
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ── Contact Form — mailto ──────────────────
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const company = document.getElementById('company').value;
    const message = document.getElementById('message').value;

    const subject = encodeURIComponent(`New Inquiry from ${name} — ${company || 'N/A'}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nCompany: ${company || 'N/A'}\n\nMessage:\n${message}`
    );

    window.open(`mailto:se3morellc@gmail.com?subject=${subject}&body=${body}`, '_self');

    const btn = contactForm.querySelector('button[type="submit"]');
    btn.innerHTML = '<span>Opening email...</span>';
    btn.disabled = true;

    setTimeout(() => {
      contactForm.querySelectorAll('.form-group').forEach(g => g.style.display = 'none');
      btn.style.display = 'none';
      formSuccess.classList.add('visible');
      contactForm.reset();
    }, 1500);
  });

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
  const GROQ_KEY = (typeof SEMORE_CONFIG !== 'undefined' && SEMORE_CONFIG.GROQ_API_KEY) || '';
  const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

  const SYSTEM_PROMPT = `You are the SE:MORE AI assistant on the SE:MORE website. You answer questions about the company, its services, founders, and how it can help businesses.

ABOUT SE:MORE:
SE:MORE is a technology-enablement company that helps businesses see more ways to grow, profit, and operate smarter through technology. The name "SE:MORE" uses the colon as two eyes, representing vision, clarity, and insight. The company is based in New York, USA and works remotely worldwide. Email: se3morellc@gmail.com

FOUNDERS:
- Hitayu Parikh — Co-Founder (LinkedIn: linkedin.com/in/hitayu-parikh/)
- Mohit Unecha — Co-Founder (LinkedIn: linkedin.com/in/mohitunecha/)

WHAT SE:MORE DOES:
1. Automate manual workflows — eliminate repetitive tasks, save hours weekly
2. Integrate AI into existing systems — no rip-and-replace needed
3. Modernize outdated tools — bridge legacy and new systems seamlessly
4. Build profitable tech solutions — reduce costs, increase revenue from day one

WHY SE:MORE IS DIFFERENT:
- Insight-driven: data-backed solutions, not guesswork
- Uses what the business already has: no expensive replacements
- Fast implementation: delivers in weeks, not months
- Measurable results: clear KPIs on every engagement

PROCESS:
Step 1: "We See" — Discovery & clarity, audit workflows, tools, data
Step 2: "We Simplify" — Strategy & solution design, clear actionable roadmaps
Step 3: "You Scale" — Implementation & optimization, measurable results

RESULTS:
- Saved clients 20+ hours/week through automation
- Reduced customer support load by 35% via AI integration
- Streamlined operations without replacing legacy systems

BRAND VALUES: Vision, Simplicity, Insight, Human-Centric Technology

INSTRUCTIONS:
- Be friendly, concise, and helpful
- Keep responses to 2-3 sentences unless more detail is asked for
- If asked about pricing, say to book a free consultation for custom quotes
- If asked about things unrelated to SE:MORE, politely redirect
- Encourage visitors to book a consultation or email se3morellc@gmail.com`;

  const chatWidget = document.getElementById('chatWidget');
  const chatToggle = document.getElementById('chatToggle');
  const chatWindow = document.getElementById('chatWindow');
  const chatMessages = document.getElementById('chatMessages');
  const chatFormEl = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');

  let chatHistory = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'assistant', content: "Hey! I'm the SE:MORE AI assistant. Ask me anything about our services, how we work, our founders, or how we can help your business. What would you like to know?" }
  ];

  chatToggle.addEventListener('click', () => {
    chatWidget.classList.toggle('open');
    if (chatWidget.classList.contains('open')) {
      chatInput.focus();
    }
  });

  function addMessage(text, sender) {
    const div = document.createElement('div');
    div.className = `chat-msg ${sender}`;
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.textContent = text;
    div.appendChild(bubble);
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return div;
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

  async function sendToGroq(userMessage) {
    chatHistory.push({ role: 'user', content: userMessage });

    addTypingIndicator();

    try {
      const response = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: chatHistory,
          max_tokens: 300,
          temperature: 0.7
        })
      });

      removeTypingIndicator();

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const reply = data.choices[0].message.content;

      chatHistory.push({ role: 'assistant', content: reply });
      addMessage(reply, 'bot');
    } catch (err) {
      removeTypingIndicator();
      addMessage("Sorry, I'm having trouble connecting right now. Please email us at se3morellc@gmail.com!", 'bot');
    }
  }

  chatFormEl.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = chatInput.value.trim();
    if (!msg) return;

    addMessage(msg, 'user');
    chatInput.value = '';
    sendToGroq(msg);
  });

});
