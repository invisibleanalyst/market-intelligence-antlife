"""Variant 2 service demonstrations, motion and chapter navigation."""
import asyncio
import os
from playwright.async_api import async_playwright, expect
BASE=os.environ.get('ANTLIFE_TEST_URL','http://127.0.0.1:4174')
async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  cases=[('market-entry','Higher entry costs','Market C -7'),('feasibility','Lower margin','1,000: 4'),('diligence','More evidence','Contradicted: 2'),('sector','Cost pressure','Services: 26'),('strategy','Costs +$5k','Base revenue: 0'),('capital','New evidence','P6: 104')]
  for width in [390,1440]:
   page=await b.new_page(viewport={'width':width,'height':960})
   errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   await page.goto(BASE,wait_until='networkidle')
   assert await page.locator('.city-image').evaluate('(img)=>img.complete&&img.naturalWidth>1000')
   hero = await page.locator('.city-hero').bounding_box()
   assert hero['x'] == 0 and hero['width'] == width and hero['height'] >= 960
   room = page.locator('.decision-room')
   for label,slug,result,figure in [
       ('Enter a market','market-entry','Move the pilot to Market A.','$12k'),
       ('Test an investment','feasibility','Test the margin first.','650'),
       ('Review a plan','strategy','Rephase $5k of spending.','$90k')]:
    await room.get_by_role('button', name=label, exact=True).click()
    panel = room.locator('#decision-'+slug)
    assert await room.locator('.dr-panel:visible').count() == 1
    original = await panel.locator('h4').inner_text()
    await panel.locator('.dr-switch button').last.click()
    await expect(panel.locator('h4')).to_have_text(result)
    await expect(panel.locator('.dr-measure strong').first).to_have_text(figure)
    assert await panel.locator('.dr-interpretation a').get_attribute('href') == '/contact?service='+slug
    await panel.locator('summary').click()
    assert await panel.locator('details').get_attribute('open') is not None
    await panel.locator('.dr-switch button').first.click()
    await expect(panel.locator('h4')).to_have_text(original)
   await page.goto(BASE+'/services',wait_until='networkidle')
   assert await page.locator('.lens-tab').count()==6
   for sid,option,expected in cases:
    await page.locator(f'[data-lens="{sid}"]').click()
    assert await page.locator(f'[data-lens="{sid}"]').get_attribute('aria-selected')=='true'
    before=await page.locator('#lens-graph').get_attribute('aria-label')
    first_decision = await page.locator('#lens-decision').inner_text()
    await page.locator('[data-lens-scenario="alternate"]').click()
    assert await page.locator('[data-lens-scenario="alternate"]').inner_text()==option
    assert await page.locator('#lens-graph').get_attribute('aria-label')!=before
    accessible=(await page.locator('#lens-data').text_content())+' '+(await page.locator('#lens-graph').get_attribute('aria-label'))
    assert expected in accessible,(sid,accessible)
    assert await page.locator('#lens-decision').inner_text() != first_decision
    assert await page.locator('#lens-graph canvas').evaluate(
        "(canvas) => Chart.getChart(canvas).getDatasetMeta(0).data.length > 0"
    )
    assert not await page.evaluate('document.documentElement.scrollWidth>innerWidth'),(width,sid)
   await page.locator('[data-lens="capital"]').focus();await page.keyboard.press('Home')
   assert await page.locator('[data-lens="market-entry"]').get_attribute('aria-selected')=='true'
   await page.keyboard.press('End')
   assert await page.locator('[data-lens="capital"]').evaluate('(e)=>document.activeElement===e')
   await page.goto(BASE+'/services#sector')
   assert await page.locator('[data-lens="sector"]').get_attribute('aria-selected')=='true'
   await page.goto(BASE+'/insights')
   await page.locator('.pixel-field').scroll_into_view_if_needed()
   await page.wait_for_function('document.querySelector(".pixel-field").classList.contains("is-playing")')
   await page.emulate_media(reduced_motion='reduce')
   assert await page.locator('.pixel-cell').first.evaluate('(e)=>getComputedStyle(e).animationName')=='none'
   assert await page.locator('.replay-pixels').is_disabled()
   assert await page.evaluate('getComputedStyle(document.documentElement).scrollBehavior')=='auto'
   await page.goto(BASE+'/work/expansion-economics')
   await page.locator('#case-conclusion').evaluate("el => el.scrollIntoView({block:'start',behavior:'instant'})")
   await expect(page.locator('.chapter-nav a[href="#case-conclusion"]')).to_have_attribute('aria-current','location')
   assert not errors,errors
   await page.close()
  await b.close()
 print('PASS: all six service demonstrations and alternate values at mobile/desktop; keyboard selection; deep links; image load; reduced motion; scrolling chapter state. No page errors.')
asyncio.run(main())
