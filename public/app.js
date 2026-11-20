import { npv, decision, money, injectedRegression } from '/finance.mjs';
const $ = (id)=>document.getElementById(id);
const presets = {
  baseline:{initial:1000,rate:10,cashflows:'600, 600'},
  zero:{initial:1000,rate:0,cashflows:'600, 600'},
  rejection:{initial:1000,rate:10,cashflows:'350, 350'}
};
function readModel(){
  const initial=Number($('initial').value), rate=Number($('rate').value);
  if ($('initial').value.trim()==='' || $('rate').value.trim()==='') throw new Error('Investment and rate are required.');
  const tokens=$('cashflows').value.split(',').map(t=>t.trim());
  if(tokens.some(t=>t==='' || !/^[+-]?(\d+(\.\d*)?|\.\d+)$/.test(t))) throw new Error('Enter valid comma-separated numeric cash flows.');
  const flows=tokens.map(Number);
  return {initial,rate,flows};
}
function evaluate(){
  $('error').hidden=true;
  try{
    const {initial,rate,flows}=readModel();
    const value=$('inject-fault').checked?injectedRegression(initial,rate,flows):npv(initial,rate,flows);
    if (!Number.isFinite(value)) throw new RangeError('Result is not finite.');
    $('npv').textContent=money(value);
    const choice=decision(value);
    $('decision').textContent=choice;
    $('decision').style.color=choice==='ACCEPT'?'#5ddec6':'#f2c376';
    $('decision-info').textContent=choice==='ACCEPT'?'Non-negative NPV under the stated assumptions':'Negative NPV under the stated assumptions';
    $('formula').textContent=`NPV = −${initial.toLocaleString('en-US')} + `+flows.map((flow,i)=>`${flow.toLocaleString('en-US')} ÷ ${(1+rate/100).toLocaleString('en-US')}^${i+1}`).join(' + ');
  }catch(e){$('npv').textContent='—';$('decision').textContent='INVALID INPUT';$('decision-info').textContent='Correct the fields above';$('formula').textContent='No valuation was performed.';$('error').textContent=e.message;$('error').hidden=false;}
}
$('valuation-form').addEventListener('submit',e=>{e.preventDefault();evaluate();});
document.querySelectorAll('[data-preset]').forEach(button=>button.addEventListener('click',()=>{
  const preset=presets[button.dataset.preset];
  $('initial').value=preset.initial;$('rate').value=preset.rate;$('cashflows').value=preset.cashflows;
  document.querySelectorAll('[data-preset]').forEach(b=>b.classList.toggle('active',b===button));
  evaluate();
}));
$('inject-fault').addEventListener('change',e=>{
  const injected=e.target.checked;
  $('fault-status').textContent=injected?'REGRESSION PATCHED · Historical fault path now discounts each period correctly':'SAFE MODE · Correct model active';
  $('fault-status').classList.remove('bad');
  evaluate();
});
evaluate();