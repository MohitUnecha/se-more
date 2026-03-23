const nodemailer = require('nodemailer');

const allowedOrigins = ['https://semore.tech', 'https://www.semore.tech', 'https://se-more.github.io'];

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

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  if (!emailPattern.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
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
