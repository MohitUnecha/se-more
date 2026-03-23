const nodemailer = require('nodemailer');

const allowedOrigins = ['https://semore.tech', 'https://www.semore.tech', 'https://se-more.github.io'];
const minimumFormFillMs = 2500;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function applyCors(req, res) {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function sanitizeLine(value = '') {
  return String(value).replace(/[\r\n]+/g, ' ').trim();
}

function createTransporter() {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    const error = new Error(
      'Email credentials are not configured. Set EMAIL_USER and EMAIL_PASS in Vercel.'
    );
    error.status = 500;
    throw error;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });
}

async function verifyRecaptchaToken(token, remoteIp) {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    const error = new Error('reCAPTCHA is not configured. Set RECAPTCHA_SECRET_KEY in Vercel.');
    error.status = 500;
    throw error;
  }

  if (!token) {
    const error = new Error('Please complete reCAPTCHA before sending your message.');
    error.status = 400;
    throw error;
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
  const emailUser = process.env.EMAIL_USER;

  const name = sanitizeLine(req.body?.name);
  const email = sanitizeLine(req.body?.email);
  const company = sanitizeLine(req.body?.company);
  const message = String(req.body?.message || '').trim();
  const website = String(req.body?.website || '').trim();
  const formStartedAt = Number(req.body?.formStartedAt || 0);
  const recaptchaToken = String(req.body?.recaptchaToken || '').trim();
  const forwardedFor = req.headers['x-forwarded-for'];
  const remoteIp =
    typeof forwardedFor === 'string' ? forwardedFor.split(',')[0].trim() : undefined;

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
    await verifyRecaptchaToken(recaptchaToken, remoteIp);
    const transporter = createTransporter();
    const result = await transporter.sendMail({
      from: `"SE:MORE Contact" <${emailUser}>`,
      to: destinationEmail,
      replyTo: email,
      subject,
      text: plainText
    });

    return res.status(200).json({ ok: true, id: result.messageId });
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
