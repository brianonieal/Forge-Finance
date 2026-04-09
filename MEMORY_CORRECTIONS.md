# MEMORY_CORRECTIONS.md
# Forge Finance | Correction Memory -- REFLEXION Entries
# Written at every gate close (mandatory)
# This is the benchmarking dataset for the independent study
# Blueprint v10

---

## CALIBRATION SUMMARY (updated after every 3 gates)

Gates completed: 0
Overall estimate accuracy: [pending first 3 gates]
Systematic biases: [pending data]
Recommended buffer: [pending data]

---

## KNOWN PRE-BUILD CALIBRATIONS

Based on prior Forge Finance versions and risk analysis:

Plaid gates:       budget +50% on raw estimate
Schema gates:      budget +30% on raw estimate
Streaming gates:   budget 3 hour minimum regardless of apparent complexity
RLS gates:         budget +2 hours if adding 3+ tables with auth
LangGraph gates:   budget +50% for first-time integration

These are starting hypotheses. Actual reflexion data will confirm
or correct these buffers after the first few gates.

---

## REFLEXION LOG (permanent -- never delete)

[First entry will be written at v0.0.0 gate close]

---

## RESEARCH STUDY NOTES

Target: 13 reflexion entries from Forge Finance v0.0.0 through v1.0.0
Each entry is a structured data point for the benchmarking study.

Questions this data will answer:
  1. Which gate types does Blueprint v10 systematically mis-estimate?
  2. Does accuracy improve over the 13-gate arc? (learning curve)
  3. Are the pre-build calibrations above validated or corrected?
  4. What is the baseline accuracy for Category 2 benchmarking?

Collect faithfully. Every gate. No skipping.
