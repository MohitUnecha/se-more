const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadLocalConfig() {
  const configPath = path.join(__dirname, '..', 'config.js');

  if (!fs.existsSync(configPath)) {
    return {};
  }

  try {
    const source = fs.readFileSync(configPath, 'utf8');
    const sandbox = { module: { exports: {} }, exports: {} };

    vm.runInNewContext(
      `${source}\nmodule.exports = typeof SEMORE_CONFIG !== 'undefined' ? SEMORE_CONFIG : module.exports;`,
      sandbox,
      { filename: configPath }
    );

    return sandbox.module.exports || {};
  } catch (error) {
    console.error('Failed to load local config.js:', error);
    return {};
  }
}

function getGroqApiKey() {
  if (process.env.GROQ_API_KEY) {
    return process.env.GROQ_API_KEY;
  }

  const localConfig = loadLocalConfig();
  return localConfig.GROQ_API_KEY || '';
}

async function handler(req, res) {
  const allowedOrigins = [
    'https://semore.tech',
    'https://www.semore.tech',
    'https://se-more.github.io',
    'https://se-more.vercel.app',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:8000',
    'http://127.0.0.1:8000'
  ];
  const origin = req.headers?.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const GROQ_API_KEY = getGroqApiKey();
  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: 'GROQ_API_KEY is not configured.' });
  }

  if (!Array.isArray(req.body?.messages) || req.body.messages.length === 0) {
    return res.status(400).json({ error: 'Request body must include a non-empty messages array.' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: req.body.model || 'llama-3.3-70b-versatile',
        messages: req.body.messages,
        max_tokens: req.body.max_tokens || 300,
        temperature: req.body.temperature || 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error('Groq API error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = handler;
