/** Browser-only incident lab. All accounts/requests are fabricated within this page. */
import { SCENARIOS, runScenario } from '/sentinel/engine.mjs';
import { evaluateLedger } from '/sentinel/oracle.mjs';
const $ = id => document.getElementById(id);
const state = { scenarioId:'duplicate', mode:'vulnerable', runs:0 };
const currency = cents => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:2,maximumFractionDigits:2}).format(cents/100);
function el(tag, className, text) { const n=document.createElement(tag); if(className)n.className=className;if(text!==undefined)n.textContent=text;return n; }

function chooseScenario(id) {
  state.scenarioId = id;
  $('scenario-list').querySelectorAll('button').forEach(b => {const active=b.dataset.scenario===id; b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));});
  const scenario=SCENARIOS.find(s=>s.id===id);
  $('scenario-title').textContent=scenario.title;
  $('scenario-description').textContent=scenario.description;
  $('scenario-rule').textContent=scenario.brokenRule;
  run();
}
function setMode(mode) {
  state.mode=mode;
  document.querySelectorAll('[data-mode]').forEach(b=>{const active=b.dataset.mode===mode;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
  $('mode-description').textContent=mode==='vulnerable'?'Faults are deliberately injected into this synthetic processor to demonstrate unsafe behavior.':'Protected mode applies tenant, funds, accounting and idempotency controls before settlement.';
  run();
}
function renderScenarios() {
  for(const [index,scenario] of SCENARIOS.entries()){
    const b=el('button','scenario-option'); b.type='button';b.dataset.scenario=scenario.id;b.setAttribute('aria-pressed','false');
    b.append(el('span','scenario-index',String(index+1).padStart(2,'0')));
    const body=el('span','scenario-option-content');body.append(el('strong','',scenario.title),el('small','',scenario.eyebrow));b.append(body,el('span','scenario-chevron','↗'));
    b.addEventListener('click',()=>chooseScenario(scenario.id));
    $('scenario-list').append(b);
  }
}
function renderAccounts(run) {
  const grid=$('accounts-grid');grid.replaceChildren();
  for(const account of run.accounts){
    const initial=run.openingAccounts.find(a=>a.id===account.id)?.balanceCents??0;
    const delta=account.balanceCents-initial;
    const card=el('article','account-tile'+(account.balanceCents<0?' account-negative':''));
    const upper=el('div','account-upper');upper.append(el('span','tenant-label',account.tenantId.toUpperCase()),el('span','account-marker',account.tenantId==='acme'?'◆':'◇'));
    card.append(upper,el('div','account-name',account.name),el('strong','account-balance',currency(account.balanceCents)));
    card.append(el('div','account-delta '+(delta<0?'delta-negative':delta>0?'delta-positive':'delta-zero'),(delta>0?'+':'')+currency(delta)+' from opening'));
    grid.append(card);
  }
}
function renderJournal(run) {
  const body=$('journal-body');body.replaceChildren();$('journal-count').textContent=`${run.journal.length} SETTLED`;
  if(!run.journal.length){const tr=el('tr');const td=el('td','empty-table','No funds settled. The policy rejected this incident.');td.colSpan=4;tr.append(td);body.append(tr);return;}
  for(const tx of run.journal){const tr=el('tr');
    tr.append(el('td','id-cell',tx.requestId),el('td','negative-money','−'+currency(tx.debitCents)),el('td','positive-money','+'+currency(tx.creditCents)));
    const status=el('td');status.append(el('span','settled-pill','SETTLED'));tr.append(status);body.append(tr);
  }
}
function renderOracle(verdict) {
  const panel=$('verdict-panel');panel.classList.toggle('blocked',!verdict.safeToRelease);panel.classList.toggle('approved',verdict.safeToRelease);
  $('verdict-signal').textContent=verdict.safeToRelease?'● RELEASE SAFE':'● RELEASE BLOCKED';
  $('verdict-symbol').textContent=verdict.safeToRelease?'✓':'!';
  $('verdict-title').textContent=verdict.safeToRelease?'All financial invariants hold':'Financial invariant violated';
  $('verdict-description').textContent=verdict.safeToRelease?'The independent accounting oracle found no unauthorized settlement, imbalance or duplicate.':`${verdict.failures.length} independent control${verdict.failures.length===1?'':'s'} failed: ${verdict.failures.map(f=>f.label.toLowerCase()).join('; ')}.`;
  $('verdict-checks').textContent=`${verdict.passedCount} / ${verdict.totalCount} CONTROLS PASSED`;
  $('stat-incidents').textContent=String(verdict.failures.length).padStart(2,'0');
  $('oracle-score').textContent=`${verdict.passedCount}/${verdict.totalCount}`;
  const list=$('oracle-check-list');list.replaceChildren();
  for(const check of verdict.checks){
    const item=el('div','invariant-row '+(check.passed?'invariant-passed':'invariant-failed'));
    item.append(el('span','invariant-status',check.passed?'✓':'!'));
    const content=el('div','invariant-text');content.append(el('strong','',check.label),el('small','',check.detail));item.append(content);
    item.append(el('span','invariant-tag',check.passed?'PASS':'FAIL'));list.append(item);
  }
}
function renderTrace(run) {
  const list=$('trace-list');list.replaceChildren();
  for(const event of run.trace){const row=el('li','trace-row trace-'+event.level);
    row.append(el('span','trace-sequence',String(event.order).padStart(2,'0')));
    const desc=el('div','trace-description');desc.append(el('strong','',event.code.replaceAll('_',' ')),el('p','',event.description));row.append(desc);list.append(row);
  }
}
function run(){
  const result=runScenario(state.scenarioId,state.mode), verdict=evaluateLedger(result);
  state.runs++;
  renderAccounts(result);renderJournal(result);renderOracle(verdict);renderTrace(result);
  $('verdict-engine').textContent=state.mode==='vulnerable'?'FAULT-INJECTED SIMULATION':'GUARDED TRANSACTION REPLAY';
  return verdict;
}
renderScenarios();
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode)));
$('run-incident').addEventListener('click',run);
$('reset-lab').addEventListener('click',()=>{state.mode='vulnerable';document.querySelectorAll('[data-mode]').forEach(b=>{const active=b.dataset.mode==='vulnerable';b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});chooseScenario('duplicate');$('mode-description').textContent='Faults are deliberately injected into this synthetic processor to demonstrate unsafe behavior.';});
chooseScenario('duplicate');