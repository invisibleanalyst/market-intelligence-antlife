"""Run against scripts/dev_server.py. Uses the environment's existing Playwright."""
import asyncio
import json
import os
from pathlib import Path
from urllib.parse import urlsplit
from playwright.async_api import async_playwright
BASE = os.environ.get('ANTLIFE_TEST_URL', 'http://127.0.0.1:4173')
ROOT = Path(__file__).resolve().parents[1]
ROUTES = ['/'] + [r['source'] for r in json.loads((ROOT / 'vercel.json').read_text())['rewrites']]
async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox'])
        checks = 0
        for width in [360, 390, 768, 1024, 1440]:
            page = await browser.new_page(viewport={'width': width, 'height': 900})
            errors = []
            page.on('pageerror', lambda e: errors.append(str(e)))
            for route in ROUTES:
                response = await page.goto(BASE + route, wait_until='networkidle')
                assert response.status == 200, (width, route, response.status)
                assert await page.locator('h1').count() == 1, route
                assert not await page.evaluate('document.documentElement.scrollWidth > innerWidth'), (width, route, 'overflow')
                assert await page.evaluate('document.fonts.check("16px Figtree")'), route
                assert not errors, (route, errors)
                checks += 1
            await page.close()
        page = await browser.new_page(viewport={'width': 390, 'height': 844})
        await page.goto(BASE)
        menu = page.locator('.menu-toggle')
        await menu.click(); assert await menu.get_attribute('aria-expanded') == 'true'
        await page.keyboard.press('Escape'); assert await menu.get_attribute('aria-expanded') == 'false'
        assert await menu.evaluate('(el) => el === document.activeElement')
        await menu.click(); await page.locator('#main-nav a[href="/services"]').click()
        assert urlsplit(page.url).path == '/services'
        await page.goto(BASE + '/work/mitumba-to-yarn')
        await page.locator('#stage-tab-0').focus(); await page.keyboard.press('ArrowRight')
        assert await page.locator('#stage-tab-1').get_attribute('aria-selected') == 'true'
        assert 'usable input cost' in await page.locator('#stage-title').inner_text()
        await page.keyboard.press('End'); assert await page.locator('#stage-tab-3').get_attribute('aria-selected') == 'true'
        await page.locator('[data-stage-next]').click(); assert await page.locator('#stage-tab-0').get_attribute('aria-selected') == 'true'
        await page.goto(BASE + '/work/expansion-economics')
        assert await page.locator('.loss-row').count() == 4
        await page.locator('[data-profit="adjusted"]').click()
        assert '542,038' in await page.locator('#loss-chart').get_attribute('aria-label')
        assert await page.locator('#scenario-profit').inner_text() == '−$35,000'
        await page.locator('#revenue').fill('200'); await page.locator('#cost').fill('100')
        assert await page.locator('#scenario-profit').inner_text() == '$30,000'
        assert '200 customers' in await page.locator('#scenario-breakeven').inner_text()
        await page.locator('#reset-scenario').click(); assert await page.locator('#scenario-profit').inner_text() == '−$35,000'
        await page.goto(BASE + '/insights')
        await page.locator('[data-filter="research"]').click(); assert await page.locator('.insight-row:visible').count() == 0
        assert 'No research' in await page.locator('#filter-status').inner_text()
        await page.locator('[data-filter="observation"]').click(); assert await page.locator('.insight-row:visible').count() == 1
        await page.goto(BASE + '/contact?service=feasibility')
        assert await page.locator('#service').input_value() == 'feasibility'
        await page.locator('button[type=submit]').click()
        assert not await page.locator('#form-status').inner_text()
        await page.locator('#name').fill('Preview Reviewer'); await page.locator('#email').fill('reviewer@example.org')
        await page.locator('#message').fill('Please help assess the economics of our market entry.')
        # Local server rejects actual email delivery; ensure input is retained.
        await page.locator('button[type=submit]').click()
        await page.wait_for_function('document.querySelector("#form-status").dataset.state === "error"')
        assert 'Please help' in await page.locator('#message').input_value()
        # Intercepted success is UI validation only; no actual email is sent.
        await page.route('**/api/contact', lambda route: route.fulfill(status=200, content_type='application/json', body='{"ok":true}'))
        await page.locator('button[type=submit]').click()
        await page.wait_for_function('document.querySelector("#form-status").dataset.state === "success"')
        assert await page.locator('#message').input_value() == ''
        await page.emulate_media(reduced_motion='reduce')
        assert await page.evaluate('getComputedStyle(document.documentElement).scrollBehavior') == 'auto'
        await page.close()
        # Check local navigation and resources through their normal HTTP paths.
        page = await browser.new_page()
        seen = set()
        for route in ROUTES:
            await page.goto(BASE + route)
            paths = await page.locator('a[href],img[src],link[rel=stylesheet],script[src]').evaluate_all('(els)=>els.map(e=>e.getAttribute("href")||e.getAttribute("src")).filter(p=>p.startsWith("/"))')
            for path in paths:
                path = path.split('#')[0]
                if path not in seen:
                    response = await page.request.get(BASE + path)
                    assert response.ok, (path, response.status)
                    seen.add(path)
        response = await page.request.get(BASE + '/missing'); assert response.status == 404
        await page.close()
        # No-JavaScript reading and navigation remain available.
        context = await browser.new_context(java_script_enabled=False, viewport={'width':390,'height':844})
        page = await context.new_page(); await page.goto(BASE)
        assert await page.locator('#main-nav').is_visible()
        assert await page.locator('h1').is_visible()
        await context.close()
        await browser.close()
        print(f'PASS: {checks} route/viewport combinations; {len(seen)} local links/resources; menu, keyboard tabs, chart, calculator, filters, form validation/error/mocked success, reduced motion and no-JS navigation.')
asyncio.run(main())
