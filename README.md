# Antlife public website

Conversation-led public site for **Antlife — Investment Intelligence**. Variation 1 is maintained on `redesign/antlife-public-site` at commit `2100194`. Variant 2, the Investment Journal, is maintained on `redesign/variant-2-investment-journal`. The owner authorised committing and pushing both variants to GitHub on 17 November 2026. No hosted preview or production deployment has been performed by the agent.

## Run locally

Requires Python 3; no package install or build is needed.

```sh
cd /workspace/market-intelligence-antlife
python3 scripts/dev_server.py --port 4173
```

The server reads the route rewrites from `vercel.json`. It deliberately returns HTTP 503 for contact submissions, so a local enquiry is never falsely reported as delivered. The browser retains the message and offers direct email. Use the existing isolated checkout; do not create additional worktrees unless requested.

## Structure

- Root HTML: Home, Services, Approach, Work, two case pages, Insights, one editorial observation, About, Contact and draft privacy information.
- `assets/site.css`, `assets/site.js`: shared brand styling, responsive navigation and interactions.
- `assets/journal.css`, `assets/journal.js`: Variant 2 editorial treatment, six illustrative service demonstrations, chapter navigation and bounded pixel animations.
- `assets/nairobi-editorial.webp`: generated Nairobi-inspired architectural illustration, not documentary photography; its provenance is recorded in `assets/IMAGE_PROVENANCE.md`.
- `assets/brand`: supplied outlined logo masters and favicon; do not redraw or distort them.
- `assets/fonts`: supplied brand fonts and SIL Open Font Licences.
- `assets/evidence-landscape.svg`: original decorative pixel landscape; it is not quantitative data.
- `api/contact.js`: Vercel Node function for Resend. No SDK or client-side credentials.
- `scripts/dev_server.py`: local static server; it does not execute Vercel functions.

Edit the HTML directly. There is no generated build directory or content generator to run. Internal links use clean routes defined in `vercel.json`.

## Checks

```sh
node --check assets/site.js
node --check api/contact.js
node --test tests/contact.test.js
# With the preview server running; Python Playwright and Chromium are provided in this environment:
python3 tests/browser_smoke.py
ANTLIFE_TEST_URL=http://127.0.0.1:4173 python3 tests/journal_smoke.py
```

The journal suite checks all six service views and alternate scenarios, keyboard selection, hash links, image loading, reduced motion and scroll chapter state. All inputs in the service lab are fictional and distinct from historical case evidence.

The shared browser suite covers routes at 360, 390, 768, 1024 and 1440px, local links, navigation, keyboard tabs, data views, calculator, filters, form failures and intercepted success, reduced motion, and no-JavaScript navigation. API tests mock the provider; they do not send email.

## Email configuration (later, before activation)

Configure these server-side variables through Vercel environment settings, never in HTML, JS delivered to the browser, or committed files:

- `RESEND_API_KEY`: a Resend sending credential.
- `CONTACT_FROM`: a sender on a domain verified in Resend, such as `Antlife <enquiries@antlife.one>` once verified.
- `SITE_ORIGIN`: exact approved origin, including scheme; production would be `https://www.antlife.one` only if that is the chosen canonical host. Configure separately for a hosted preview.

The recipient is fixed to `info@antlife.one`; Reply-To is the validated enquirer email. This sends a staff notification only. It does not provision a mailbox or send an automatic acknowledgement to the visitor. The handler checks origin and input, uses a honeypot, escapes HTML, limits field lengths, and fails closed when unconfigured. Before activation, add and verify deployment-level request throttling/anti-abuse controls; a honeypot is not a complete spam defence. Test real delivery and domain authentication separately with authorisation. Never send confidential client content in tests.

## Content and launch gates

Read `PROJECT_STATE.md`. Historical case figures are not verified current data. Keep the commissioned/independent and historical/reconstructed distinctions. Additional editorial work, privacy details, analytics and payments require further configuration/review. Commits, pushes, hosted preview deployment and production launch require separate user authorisation.
