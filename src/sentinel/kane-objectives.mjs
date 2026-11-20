/** Real-browser acceptance goals. An expected UI BLOCK is a successful assertion, not a failed Kane run. */
export const SENTINEL_KANE_OBJECTIVES = Object.freeze([
  {
    id:'duplicate-unsafe', expect:'passed', objective:
      'Open the AXIOM SENTINEL Payment Integrity Lab. In the Incident laboratory select The $7,500 double payment. Select Fault injected and click Run adversarial scenario. ASSERT that the independent financial oracle displays RELEASE BLOCKED and the transaction journal shows exactly 2 SETTLED rows with the SAME request ID pay-invoice-042. ASSERT the Acme Operating balance shows $5,000.00 and the Acme Vendor balance shows $16,500.00. Report the actual visible evidence and the idempotency invariant failure. This is a disclosed synthetic double payment, not real funds.'
  },
  {
    id:'duplicate-guarded', expect:'passed', objective:
      'Open the AXIOM SENTINEL Payment Integrity Lab. Select The $7,500 double payment, then select Guarded build and click Run adversarial scenario. ASSERT that the financial oracle displays RELEASE SAFE, the transaction journal shows exactly 1 SETTLED, and the account balances are Acme Operating $12,500.00 and Acme Vendor $9,000.00. ASSERT that 8 / 8 controls passed and the execution trace includes DUPLICATE SUPPRESSED. Report what was visibly verified.'
  },
  {
    id:'overdraft-and-tenant', expect:'passed', objective:
      'Open the AXIOM SENTINEL Payment Integrity Lab. Select Reserve overdraft and Fault injected; click Run adversarial scenario; ASSERT RELEASE BLOCKED, Acme Reserve shows -$1,500.00 and the No overdraft control is FAIL. Switch to Guarded build; ASSERT RELEASE SAFE, 0 SETTLED and the trace includes INSUFFICIENT FUNDS. Then select Cross-tenant transfer, switch back to Fault injected, ASSERT RELEASE BLOCKED and a No cross-tenant settlements control FAIL; select Guarded build again, ASSERT RELEASE SAFE and 0 SETTLED. Report the outcomes from the actual interface.'
  },
  {
    id:'accounting-and-key', expect:'passed', objective:
      'Open AXIOM SENTINEL Payment Integrity Lab. Select Phantom credit, choose Fault injected and click Run adversarial scenario. ASSERT RELEASE BLOCKED, the transaction journal shows a $3,000.00 debit and $3,050.00 credit, and the total money supply conserved check is FAIL. Switch to Guarded build and ASSERT RELEASE SAFE. Then select Idempotency collision, select Fault injected and ASSERT RELEASE BLOCKED with 2 SETTLED; select Guarded build and ASSERT RELEASE SAFE with 1 SETTLED and execution trace showing IDEMPOTENCY CONFLICT. Report actual visible evidence from all four checks.'
  }
]);