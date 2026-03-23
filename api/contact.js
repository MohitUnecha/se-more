const nodemailer = require('nodemailer');

const allowedOrigins = ['https://semore.tech', 'https://www.semore.tech', 'https://se-more.github.io'];
const minimumFormFillMs = 2500;
const rateLimitWindowMs = 10 * 60 * 1000;
const maxRequestsPerWindow = 5;
const minimumRecaptchaScore = 0.3;
const rateLimitStore = new Map();

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeHostname(value = '') {
  return String(value).trim().replace(/^\[|\]$/g, '').toLowerCase();
}

function isLocalHostname(value = '') {
  const hostname = normalizeHostname(value);
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
}

function getOriginHostname(origin) {
  if (!origin) {
    return '';
  }

  try {
    return normalizeHostname(new URL(origin).hostname);
  } catch {
    return '';
  }
}

function getRequestHostname(req) {
  const forwardedHost = typeof req.headers['x-forwarded-host'] === 'string'
    ? req.headers['x-forwarded-host'].split(',')[0].trim()
    : '';
  const host = forwardedHost || req.headers.host || '';
  return normalizeHostname(host.split(':')[0]);
}

function isAllowedOrigin(origin) {
  if (!origin) {
    return false;
  }

  if (allowedOrigins.includes(origin)) {
    return true;
  }

  return isLocalHostname(getOriginHostname(origin));
}

function isLocalRequest(req) {
  // Treat a request as local only when the server host itself is local.
  // Do not trust Origin for this decision because it can be spoofed by non-browser clients.
  return isLocalHostname(getRequestHostname(req));
}

function applyCors(req, res) {
  const origin = req.headers.origin;
  if (isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function sanitizeLine(value = '') {
  return String(value).replace(/[\r\n]+/g, ' ').trim();
}

function extractClientIp(forwardedFor) {
  return typeof forwardedFor === 'string' ? forwardedFor.split(',')[0].trim() : '';
}

function assertRateLimit(ipAddress) {
  if (!ipAddress) {
    return;
  }

  const now = Date.now();
  const existing = rateLimitStore.get(ipAddress) || [];
  const recent = existing.filter((timestamp) => now - timestamp < rateLimitWindowMs);

  if (recent.length >= maxRequestsPerWindow) {
    const error = new Error('Too many messages from this network. Please try again later.');
    error.status = 429;
    throw error;
  }

  recent.push(now);
  rateLimitStore.set(ipAddress, recent);
}

function createTransporter({ localMode = false } = {}) {
  const smtpUrl = process.env.SMTP_URL;
  const smtpHost = process.env.EMAIL_HOST;
  const smtpPort = Number(process.env.EMAIL_PORT || 587);
  const smtpUser = process.env.EMAIL_USER;
  const smtpPass = process.env.EMAIL_PASS;
  const senderEmail = sanitizeLine(process.env.CONTACT_FROM_EMAIL || smtpUser || 'no-reply@semore.tech');

  if (smtpUrl) {
    return {
      transporter: nodemailer.createTransport(smtpUrl),
      senderEmail
    };
  }

  if (smtpHost) {
    const transportConfig = {
      host: smtpHost,
      port: Number.isFinite(smtpPort) ? smtpPort : 587,
      secure: String(process.env.EMAIL_SECURE || '').toLowerCase() === 'true'
    };

    if (smtpUser && smtpPass) {
      transportConfig.auth = {
        user: smtpUser,
        pass: smtpPass
      };
    }

    return {
      transporter: nodemailer.createTransport(transportConfig),
      senderEmail
    };
  }

  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (emailUser && emailPass) {
    return {
      transporter: nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPass
        }
      }),
      senderEmail
    };
  }

  if (localMode) {
    return {
      transporter: nodemailer.createTransport({
        streamTransport: true,
        buffer: true,
        newline: 'unix'
      }),
      senderEmail: 'no-reply@localhost'
    };
  }

  if (!emailUser || !emailPass) {
    const error = new Error(
      'Email delivery is not configured. Set SMTP_URL or EMAIL_USER and EMAIL_PASS.'
    );
    error.status = 500;
    throw error;
  }
}

async function verifyRecaptchaToken(token, remoteIp) {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  // Skip reCAPTCHA gracefully if not configured or no token — other spam
  // protections (honeypot, timing check, rate limiting) still apply.
  if (!secretKey || !token) {
    return { skipped: true, reason: !secretKey ? 'missing-secret' : 'missing-token' };
  }

  const payload = new URLSearchParams({
    secret: secretKey,
    response: token
  });

  if (remoteIp) {
    payload.set('remoteip', remoteIp);
  }

  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: payload
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.success) {
    const error = new Error('reCAPTCHA verification failed. Please try again.');
    error.status = 400;
    error.details = data['error-codes'] || null;
    throw error;
  }

  if (data.action && data.action !== 'contact_form') {
    const error = new Error('reCAPTCHA verification failed. Please try again.');
    error.status = 400;
    throw error;
  }

  if (typeof data.score === 'number' && data.score < minimumRecaptchaScore) {
    const error = new Error('Spam protection flagged this request. Please try again later.');
    error.status = 400;
    throw error;
  }

  return {
    skipped: false,
    score: typeof data.score === 'number' ? data.score : null
  };
}

async function handler(req, res) {
  applyCors(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const destinationEmail = process.env.CONTACT_TO_EMAIL || 'contact@semore.tech';
  const localMode = isLocalRequest(req);

  const name = sanitizeLine(req.body?.name);
  const email = sanitizeLine(req.body?.email);
  const company = sanitizeLine(req.body?.company);
  const message = String(req.body?.message || '').trim();
  const website = String(req.body?.website || '').trim();
  const formStartedAt = Number(req.body?.formStartedAt || 0);
  const recaptchaToken = String(req.body?.recaptchaToken || '').trim();
  const remoteIp = extractClientIp(req.headers['x-forwarded-for']);

  if (website) {
    return res.status(400).json({ error: 'Spam check failed.' });
  }

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  if (!emailPattern.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  if (!Number.isFinite(formStartedAt) || formStartedAt <= 0 || Date.now() - formStartedAt < minimumFormFillMs) {
    return res.status(400).json({ error: 'Please wait a moment and try again.' });
  }

  const subject = sanitizeLine(`New SE:MORE contact form submission from ${name}`);
  const plainText = [
    'New contact form submission',
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    `Company: ${company || 'N/A'}`,
    '',
    'Message:',
    message
  ].join('\n');

  try {
    assertRateLimit(remoteIp);
    await verifyRecaptchaToken(recaptchaToken, remoteIp);
    const { transporter, senderEmail } = createTransporter({ localMode });
    const result = await transporter.sendMail({
      from: `"SE:MORE Contact" <${senderEmail}>`,
      to: destinationEmail,
      replyTo: email,
      subject,
      text: plainText
    });

    if (localMode && result.message) {
      console.info('Local contact form preview generated.');
    }

    return res.status(200).json({ ok: true, id: result.messageId || `local-${Date.now()}` });
  } catch (error) {
    console.error('Contact form send error:', error);
    const authError =
      error.code === 'EAUTH' || error.responseCode === 535 || error.responseCode === 534;
    return res.status(error.status || 500).json({
      error: authError
        ? 'Email authentication failed. Check EMAIL_USER, EMAIL_PASS, and the Gmail account app password settings.'
        : error.message || 'Internal Server Error'
    });
  }
}

module.exports = handler;
