# Real-browser acceptance objectives (Kane CLI)

All objectives must be run against the real deployed or locally accessible app with Kane CLI after `kane-cli login`. An exit code of zero is necessary but *not sufficient*: inspect the report for actual assertions and screenshots. Never synthesize results.

1. **Baseline correct:** Navigate to the URL. Select Baseline investment. Ensure the fault switch is OFF. Evaluate. The displayed NPV must be `$41.32`, and the decision must be `ACCEPT`. Save the run.
2. **Regression caught:** At the same URL, select Baseline investment, enable Inject calculation fault. The displayed NPV must *not* be `$41.32`. Test specifically for expected `$41.32` with the fault enabled, and confirm **Kane fails**. Do not count an auth or navigation error as a caught regression.
3. **Recovery after fix:** Disable fault and evaluate. `$41.32` must return. Select Zero discount rate; verify `$200.00`. Select Loss-making case; verify `REJECT` and an NPV approximately `-$392.56` (the precise amount is `-$392.56` rounding to cents).

The demo fault injection is explicit, scoped to an isolated teaching surface, and does not modify the production math function.