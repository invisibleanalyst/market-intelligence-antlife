"""Final edition homepage, service demonstrations and chapter navigation."""
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
   assert await page.locator('.relief-landscape').evaluate('(img) => img.complete && img.naturalWidth > 0')
   study = page.locator('#entry-study')
   cost = study.locator('#entry-cost')
   net = study.locator('#market-b-net')
   result = study.locator('#entry-result')
   await expect(cost).to_have_value('20')
   await expect(net).to_contain_text('$41')
   await expect(result).to_contain_text('Market B')
   await cost.focus()
   await page.keyboard.press('Home')
   await expect(net).to_contain_text('$61')
   await page.keyboard.press('End')
   await expect(net).to_contain_text('$1')
   await expect(result).to_contain_text('Market A')
   await page.keyboard.press('Home')
   for _ in range(35):
    await page.keyboard.press('ArrowRight')
   for value, amount, decision in [('36', '$25k', 'Pilot Market B.'), ('37', '$24k', 'The markets tie.'), ('38', '$23k', 'Pilot Market A.')]:
    await page.keyboard.press('ArrowRight')
    await expect(cost).to_have_value(value)
    await expect(net).to_have_text(amount)
    await expect(result).to_have_text(decision)
   await study.locator('summary').click()
   await expect(study.locator('details')).to_have_attribute('open','')
   await study.locator('a[href="/contact?service=market-entry"]').click()
   await expect(page.locator('#service')).to_have_value('market-entry')
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
  static = await b.new_page(java_script_enabled=False,viewport={'width':390,'height':844})
  await static.goto(BASE)
  await expect(static.locator('#entry-cost')).to_be_disabled()
  await expect(static.locator('#market-b-net')).to_have_text('$41k')
  await static.get_by_text('Is this investment viable?',exact=True).click()
  await static.locator('a[href="/services#feasibility"]').click()
  await expect(static.locator('#feasibility h2')).to_be_visible()
  await static.close()
  await b.close()
 print('PASS: homepage entry-cost model and enquiry, six service demonstrations, keyboard controls, shareable service links, reduced motion and scrolling chapter state at mobile and desktop widths.')
asyncio.run(main())
