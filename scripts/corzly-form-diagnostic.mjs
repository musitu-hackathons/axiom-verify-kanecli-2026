import { chromium } from 'playwright';
const browser=await chromium.launch({executablePath:process.env.CHROME_BINARY,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const page=await browser.newPage();
await page.goto('https://careers.corzly.com/careers/sales-development-rep/apply',{waitUntil:'domcontentloaded',timeout:45000});
await page.waitForTimeout(2000);
// Synthetic, non-submitted test values used only to inspect the next step.
const v=page.locator('input');
await v.nth(0).fill('Form');
await v.nth(1).fill('Test');
await v.nth(2).fill('form-test@example.invalid');
await v.nth(4).fill('Harare, Zimbabwe');
await page.getByRole('button',{name:'Continue'}).click();
await page.waitForTimeout(2000);
// Inspect step 3 without ever reaching a submit action. All answers are synthetic.
// This diagnostic is strictly restricted to Step 2 Continue, NOT final submission.
const second=page.locator('input');
if ((await second.count()) < 5) throw Error('Unexpected step-two layout');
await second.nth(0).fill('7');
await second.nth(1).fill('0 -- synthetic form inspection; no real meetings claimed');
await second.nth(2).fill('I would ask about their current workload and whether a comparison is useful; no pressure.');
await page.locator('textarea').first().fill('Research ideal hosts, map outreach, test messages and review weekly results.');
await second.nth(3).fill('1000');
await second.nth(4).fill('2026-12-20');
await page.getByRole('button',{name:'Continue'}).click();
await page.waitForTimeout(2000);
const data=await page.evaluate(()=>{
 const clean=(s)=>String(s||'').trim().replace(/\s+/g,' ').slice(0,120);
 const elements=[...document.querySelectorAll('input,button,select,textarea,a,[role="button"]')];
 const counters={file:document.querySelectorAll('input[type=file]').length,forms:document.forms.length,iframes:document.querySelectorAll('iframe').length};
 const buttons=elements.filter(e=>['BUTTON','A'].includes(e.tagName)||e.getAttribute('role')==='button').map(e=>({tag:e.tagName,text:clean(e.innerText||e.textContent||e.getAttribute('aria-label')),type:e.getAttribute('type')})).filter(x=>x.text).slice(0,30);
 const headings=[...document.querySelectorAll('h1,h2,h3')].map(e=>clean(e.innerText)).slice(0,12);
 const fields=elements.filter(e=>['INPUT','SELECT','TEXTAREA'].includes(e.tagName)).map(e=>({tag:e.tagName,type:e.getAttribute('type')||null,name:e.getAttribute('name')||null,placeholder:e.getAttribute('placeholder')||null,aria:e.getAttribute('aria-label')||null,nearby:e.parentElement?.innerText?.slice(0,80)||null,required:e.required||e.getAttribute('aria-required')==='true'})).slice(0,25);
 return {url:location.origin+location.pathname,title:document.title,headings,counters,buttons,fields,bodySample:clean(document.body.innerText).slice(0,800)};
});
console.log('CORZLY_PAGE_DIAGNOSTIC '+JSON.stringify(data));
await browser.close();
