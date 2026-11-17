'use strict';
// Resend is deliberately inactive until a verified sender and server-side key are configured.
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method not allowed' }); }
  const origin = req.headers.origin;
  if (!origin || !process.env.SITE_ORIGIN || origin !== process.env.SITE_ORIGIN) return res.status(403).json({ error: 'Origin not permitted' });
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { return res.status(400).json({ error: 'Invalid request' }); } }
  if (!body || Array.isArray(body) || typeof body !== 'object') return res.status(400).json({ error: 'Invalid request' });
  if (body.website) return res.status(200).json({ ok: true });
  const { name, email, organisation = '', service = 'unsure', message } = body;
  const allowed = ['unsure', 'market-entry', 'feasibility', 'diligence', 'sector', 'strategy', 'capital'];
  if (typeof name !== 'string' || !name.trim() || name.length > 100 || typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || /[\r\n]/.test(email) || typeof organisation !== 'string' || organisation.length > 150 || !allowed.includes(service) || typeof message !== 'string' || message.trim().length < 20 || message.length > 5000) return res.status(400).json({ error: 'Please check the enquiry fields' });
  if (!process.env.RESEND_API_KEY || !process.env.CONTACT_FROM) return res.status(503).json({ error: 'Email delivery is not configured. Please email info@antlife.one.' });
  // Escape user content before embedding it in the branded notification.
  const escape = value => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const text = `Name: ${name.trim()}\nEmail: ${email}\nOrganisation: ${organisation}\nService: ${service}\n\n${message}`;
  const html = `<div style="background:#F2F0EA;padding:40px;font-family:Arial,sans-serif;color:#1A2420"><div style="border-top:4px solid #143A24;padding-top:24px"><p style="font-size:12px;letter-spacing:2px;color:#143A24">ANTLIFE · WEBSITE ENQUIRY</p><h1 style="font-size:30px;font-weight:400">A new conversation.</h1><p><strong>${escape(name.trim())}</strong> · ${escape(organisation)}</p><p>${escape(email)}<br>Interest: ${escape(service)}</p><div style="background:white;padding:24px;margin:24px 0;white-space:pre-wrap">${escape(message)}</div><p style="font-size:12px;color:#4A5A50">Reply to this email to respond directly to the enquirer.</p></div></div>`;
  try {
    const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(10000), body: JSON.stringify({ from: process.env.CONTACT_FROM, to: ['info@antlife.one'], reply_to: email, subject: `Website enquiry · ${service}`, text, html }) });
    if (!response.ok) return res.status(502).json({ error: 'Email delivery unavailable' });
    return res.status(200).json({ ok: true });
  } catch { return res.status(502).json({ error: 'Email delivery unavailable' }); }
};
