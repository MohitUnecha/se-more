/* ============================================
   SE:MORE — Interactive Scripts
   Gulf Blue + British Racing Green Edition
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

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
        }, 900);

        // Phase 3: Natural blink
        setTimeout(() => {
          eyeOverlay.classList.add('blink');
        }, 2200);

        // Phase 4: Blink ends, pupils dilate, then cinematic zoom
        setTimeout(() => {
          eyeOverlay.classList.remove('blink');
          eyeOverlay.classList.add('dilate');
        }, 2450);

        setTimeout(() => {
          eyeOverlay.classList.add('expanding');

          setTimeout(() => {
            eyeOverlay.classList.add('done');
            loader.style.display = 'none';
            document.body.classList.add('page-ready');
            sessionStorage.setItem('semore-intro-played', '1');
          }, 1800);
        }, 2800);
      }, 600);
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

  // ── Custom Cursor ─────────────────────────
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');
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

  if (cursorDot || cursorRing) {
    animateCursor();
    const hoverTargets = document.querySelectorAll('a, button, .service-card, .why-card, .founder-card, .result-card, [data-tilt]');
    hoverTargets.forEach(el => {
      el.addEventListener('mouseenter', () => cursorRing && cursorRing.classList.add('hovering'));
      el.addEventListener('mouseleave', () => cursorRing && cursorRing.classList.remove('hovering'));
    });
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

  const SYSTEM_PROMPT = `You are the SE:MORE AI assistant embedded on the SE:MORE company website. You are knowledgeable, friendly, and concise. Answer questions about the company, its founders, services, location, process, and how it can help businesses.

COMPANY OVERVIEW:
SE:MORE LLC is a technology-enablement company headquartered in Central New Jersey, USA. The company operates remotely and serves businesses across the United States and worldwide. SE:MORE helps businesses see more ways to grow, profit, and operate smarter through targeted technology solutions. The company name "SE:MORE" uses the colon as two eyes, symbolizing vision, clarity, and the ability to see opportunities others miss.
- Email: se3morellc@gmail.com
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
- If someone wants to get started, direct them to book a free consultation or email se3morellc@gmail.com
- For detailed service questions, reference specific use cases and tools from the service descriptions above
- If the question is unrelated to SE:MORE or business technology, politely redirect`;


  const chatWidget = document.getElementById('chatWidget');
  const chatToggle = document.getElementById('chatToggle');
  const chatWindow = document.getElementById('chatWindow');
  const chatMessages = document.getElementById('chatMessages');
  const chatFormEl = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');

  let chatHistory = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'assistant', content: "Hey! I'm the SE:MORE AI assistant. Ask me anything about our services, how we work, or how we can help your business." }
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
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
    html = html.replace(
      /(https?:\/\/[^\s<]+)/g,
      '<a href="$1" target="_blank" rel="noopener" style="color:var(--gulf-blue);text-decoration:underline;">$1</a>'
    );
    html = html.replace(
      /se3morellc@gmail\.com/g,
      '<a href="mailto:se3morellc@gmail.com" style="color:var(--gulf-blue);text-decoration:underline;">se3morellc@gmail.com</a>'
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
