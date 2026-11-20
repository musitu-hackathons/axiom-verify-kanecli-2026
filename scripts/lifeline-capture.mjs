/**
 * Actual Chromium capture of public LIFELINE website, using fictional sample data.
 * No real payment, message or external contact. Playwright writes actual browser video.
 */
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const root=resolve('lifeline-capture'), vids=resolve(root,'raw'), shots=resolve(root,'screenshots');
const home='https://lifeline.mftintelligence.com/';
const demo='https://lifeline.mftintelligence.com/demos/salon-spa-booking';
const question='Hi Tari, can you help a salon manage customer enquiries and booking requests?';
await mkdir(vids,{recursive:true}); await mkdir(shots,{recursive:true});
const report={source:home,sample_business:true,simulated_payment_only:true,real_messages_sent:false,steps:[],segments:[],errors:[],tari_verified:false,booking_verified:false};
const log=(step,ok,detail='')=>{report.steps.push({step,ok,detail});console.log((ok?'OK ':'NOT VERIFIED ')+step+' '+detail)};
const pause=async(page,label,ms=1250)=>{try{await page.screenshot({path:resolve(shots, String(report.steps.length).padStart(2,'0')+'-'+label+'.png')})}catch{}await page.waitForTimeout(ms)};
async function click(page,label,locators,strict=false){for(const get of locators){try{const el=get().first();if(await el.isVisible()){await el.click({timeout:6500});log(label,true);return true}}catch{}}log(label,false);if(strict)throw Error(label+' control not found');return false}
async function fill(page,label,locators,value){for(const get of locators){try{const el=get().first();if(await el.isVisible()){await el.fill(value);log(label,true);return true}}catch{}}log(label,false);return false}
async function go(page,url){if(url!==home&&url!==demo)throw Error('Target not allowlisted');await page.goto(url,{waitUntil:'domcontentloaded',timeout:50000});await page.waitForTimeout(2400)}
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const context=()=>browser.newContext({viewport:{width:430,height:860},isMobile:true,hasTouch:true,deviceScaleFactor:1,
 timezoneId:'Africa/Johannesburg',locale:'en-ZA',recordVideo:{dir:vids,size:{width:720,height:1280}}});
async function finish(ctx,page,id){const video=page.video();await ctx.close();const path=await video.path().catch(()=>null);report.segments.push({id,path});log('recorded actual browser video '+id,!!path)}
try{
 const ctx=await context(),page=await ctx.newPage();
 try{
  await go(page,home);log('LIFELINE homepage',/LIFELINE/i.test(await page.title()));await pause(page,'homepage',1600);
  await click(page,'Open Tari text chat',[
   ()=>page.getByRole('button',{name:/chat with tari|text chat|chat now|chat to tari|message tari|meet tari|start chat/i}),
   ()=>page.getByText('Chat with Tari',{exact:true}),()=>page.getByRole('button',{name:/^chat$/i})]);
  await pause(page,'tari-chat',1300);
  let sent=false;
  for(const f of page.frames()){
    const options=[()=>f.getByRole('textbox',{name:/message|ask|tari|chat/i}),()=>f.locator('textarea:visible'),
      ()=>f.locator('input[placeholder*="message" i]:visible'),()=>f.locator('input[placeholder*="ask" i]:visible'),()=>f.locator('[contenteditable="true"]:visible')];
    for(const get of options){try{const el=get().first();if(!await el.isVisible())continue;await el.fill(question);await page.waitForTimeout(1200);await el.press('Enter');sent=true;break}catch{}}
    if(sent)break;
  }
  log('Ask Tari in text chat',sent);
  // Tari can take more than 10 seconds: retain a genuine clip until the actual reply arrives.
  if(sent){for(let i=0;i<36;i++){await page.waitForTimeout(1500);
    const allText=(await Promise.all(page.frames().map(f=>f.locator('body').innerText().catch(()=>'')))).join('\n');
    if(/I can certainly help|Yes, I can certainly help|what part of managing your salon|you might like to see our Salon/i.test(allText)){log('Tari finished typing',true);break;}
  }}
  await pause(page,'tari-reply',3300);
  const texts=(await Promise.all(page.frames().map(f=>f.locator('body').innerText().catch(()=>'')))).join('\n');
  report.tari_verified=sent&&/I can certainly help|Yes, I can certainly help|what part of managing your salon/i.test(texts);
  log('real Tari response displayed',report.tari_verified);
 }catch(e){report.errors.push('Tari: '+e.message)}finally{await finish(ctx,page,'01-real-tari-chat')}
 const ctx2=await context(),p=await ctx2.newPage();
 try{
  await go(p,demo);log('real booking demo loads',/Salon and spa/i.test(await p.title()));await pause(p,'salon-demo',1450);
  await click(p,'Select knotless braids',[()=>p.getByRole('button',{name:/knotless braids/i}),()=>p.getByText(/knotless braids/i)],true);await pause(p,'service-selected');
  await click(p,'Choose Zara/available',[()=>p.getByRole('button',{name:/Zara Patel|Anyone available/i}),()=>p.getByText('Anyone available'),()=>p.getByText('Zara Patel')],true);await pause(p,'stylist-selected');
  await click(p,'Choose Sat 21 sample date',[()=>p.getByRole('button',{name:/Sat.*21|21.*Nov/i}),()=>p.getByText(/Sat.*21|21.*Nov/i)]);await pause(p,'date-selected',700);
  await click(p,'Choose 14:00',[()=>p.getByRole('button',{name:/14:00/i}),()=>p.getByText('14:00',{exact:true}),()=>p.getByRole('button',{name:/\d\d:\d\d/})],true);await pause(p,'time-selected');
  await click(p,'Continue booking',[()=>p.getByRole('button',{name:/^Continue$/i}),()=>p.getByText('Continue',{exact:true})]);await pause(p,'booking-details');
  const name=await fill(p,'Fictional name',[()=>p.getByLabel(/Your name/i),()=>p.getByPlaceholder(/Your name/i),()=>p.locator('input[name="name"]'),()=>p.locator('input[type="text"]')],'Demo User');
  const phone=await fill(p,'Fictional phone',[()=>p.getByLabel(/Mobile number/i),()=>p.getByPlaceholder(/082 123 4567/),()=>p.locator('input[type="tel"]')],'082 123 4567');
  if(!name||!phone)throw Error('Cannot enter fictional demo details');
  await pause(p,'before-simulated-deposit');
  if(!/simulated payment|no card is charged/i.test(await p.locator('body').innerText()))throw Error('Refusing payment: sample-only disclosure absent');
  await click(p,'Simulated deposit',[()=>p.getByRole('button',{name:/Pay.*deposit|Pay.*36/i})],true);await pause(p,'simulated-deposit');
  await click(p,'Confirm sample booking',[()=>p.getByRole('button',{name:/Confirm booking/i}),()=>p.getByText('Confirm booking',{exact:true})],true);
  await pause(p,'sample-booking-confirmed',1800);
  report.booking_verified=/SS-\d+|booking confirmed|booking reference/i.test(await p.locator('body').innerText());log('real demo confirmation visible',report.booking_verified);
  await click(p,'Team calendar',[()=>p.getByRole('button',{name:/See it in the Calendar/i}),()=>p.getByRole('tab',{name:/Calendar/i}),()=>p.getByRole('button',{name:/^Calendar$/i})]);await pause(p,'team-calendar',2500);
  await click(p,'Loyalty rewards',[()=>p.getByRole('tab',{name:/Loyalty/i}),()=>p.getByRole('button',{name:/^Loyalty$/i}),()=>p.getByText('Loyalty',{exact:true})]);await pause(p,'loyalty-rewards',2600);
 }catch(e){report.errors.push('Booking: '+e.message);log('booking flow',false,e.message)}finally{await finish(ctx2,p,'02-real-salon-booking')}
}finally{await browser.close();await writeFile(resolve(root,'capture-result.json'),JSON.stringify(report,null,2))}
if(!report.tari_verified||!report.booking_verified||report.segments.length!==2||report.errors.length)process.exitCode=1;
