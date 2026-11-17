'use strict';
const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const handler = require('../api/contact.js');
const originalFetch = global.fetch;
const original = { SITE_ORIGIN: process.env.SITE_ORIGIN, RESEND_API_KEY: process.env.RESEND_API_KEY, CONTACT_FROM: process.env.CONTACT_FROM };
after(() => { global.fetch = originalFetch; for (const [key, value] of Object.entries(original)) value === undefined ? delete process.env[key] : process.env[key] = value; });
const valid = { name: 'Preview Reviewer', email: 'reviewer@example.org', organisation: 'Example', service: 'market-entry', message: 'Please help assess our proposed market entry.' };
async function request(body = valid, method = 'POST', origin = 'https://preview.example.org') {
  let status; let payload; const headers = {};
  const res = { setHeader(k, v) { headers[k] = v; }, status(n) { status = n; return this; }, json(data) { payload = data; return this; } };
  await handler({ method, headers: { origin }, body }, res);
  return { status, payload, headers };
}
test('enquiry endpoint rejects wrong methods, origins, invalid input and missing configuration', async () => {
  process.env.SITE_ORIGIN = 'https://preview.example.org'; delete process.env.RESEND_API_KEY; delete process.env.CONTACT_FROM;
  assert.equal((await request(valid, 'GET')).status, 405);
  assert.equal((await request(valid, 'POST', 'https://other.example.org')).status, 403);
  assert.equal((await request(valid, 'POST', null)).status, 403);
  for (const body of [{}, { ...valid, email: 'invalid' }, { ...valid, message: 'short' }, { ...valid, service: 'unknown' }, { ...valid, name: ' ' }, { ...valid, email: 'x@example.org\r\nInjected' }, 'invalid-json']) assert.equal((await request(body)).status, 400);
  const unconfigured = await request(); assert.equal(unconfigured.status, 503); assert.equal(unconfigured.headers['Cache-Control'], 'no-store');
});
test('honeypot never calls the email provider', async () => {
  let calls = 0; global.fetch = async () => { calls++; throw new Error('Should not be called'); };
  assert.equal((await request({ ...valid, website: 'spam' })).status, 200); assert.equal(calls, 0);
});
test('configured delivery uses fixed recipient, reply-to, and escaped HTML', async () => {
  process.env.RESEND_API_KEY = 'test-key-not-a-secret'; process.env.CONTACT_FROM = 'Antlife <preview@example.org>';
  let sent;
  global.fetch = async (url, options) => { assert.equal(url, 'https://api.resend.com/emails'); sent = JSON.parse(options.body); return { ok: true }; };
  assert.equal((await request({ ...valid, message: '<script>alert("x")</script> This is an enquiry.' })).status, 200);
  assert.deepEqual(sent.to, ['info@antlife.one']); assert.equal(sent.reply_to, valid.email); assert.ok(sent.html.includes('&lt;script&gt;')); assert.ok(!sent.html.includes('<script>'));
});
test('provider failures never report successful delivery', async () => {
  global.fetch = async () => ({ ok: false }); assert.equal((await request()).status, 502);
  global.fetch = async () => { throw new Error('timeout'); }; assert.equal((await request()).status, 502);
});
