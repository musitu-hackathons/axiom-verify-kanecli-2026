/** Pure, deterministic example calculations. Not investment advice. */
function ensureFinite(value, label) {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new TypeError(`${label} must be finite`);
  return value;
}
export function npv(initial, ratePercent, futureCashFlows) {
  ensureFinite(initial, 'Initial outlay');
  ensureFinite(ratePercent, 'Discount rate');
  if (initial < 0) throw new RangeError('Initial outlay cannot be negative');
  if (ratePercent <= -100 || ratePercent > 1000) throw new RangeError('Discount rate must be greater than -100% and at most 1000%');
  if (!Array.isArray(futureCashFlows) || futureCashFlows.length < 1 || futureCashFlows.length > 30) throw new RangeError('Provide 1–30 future cash flows');
  const r = ratePercent / 100;
  const result = futureCashFlows.reduce((sum, raw, index) => {
    const cashflow = ensureFinite(raw, `Period ${index + 1} cash flow`);
    return sum + cashflow / (1 + r) ** (index + 1);
  }, -initial);
  if (!Number.isFinite(result)) throw new RangeError('Calculation overflow');
  return result;
}
export function decision(value) {
  ensureFinite(value, 'NPV');
  return value >= 0 ? 'ACCEPT' : 'REJECT';
}
export function money(value) {
  ensureFinite(value, 'Value');
  return new Intl.NumberFormat('en-US', {style:'currency',currency:'USD',minimumFractionDigits:2,maximumFractionDigits:2}).format(value);
}
/** The historical regression adapter, now repaired after Kane CLI found the bug.
 *  Reuse the validated period-aware NPV path rather than discounting every
 *  cash flow as though it arrived in year one.
 */
export function injectedRegression(initial, ratePercent, futureCashFlows) {
  return npv(initial, ratePercent, futureCashFlows);
}