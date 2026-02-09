## 2026-02-09 - [Test Infrastructure vs Custom Scripts]
**Learning:** Custom `ts-node` benchmark scripts may hang due to environment-specific async handling or stream buffering issues, while the existing Jest test suite works reliably.
**Action:** Prioritize enhancing existing test infrastructure or using the provided test runner for verification instead of creating standalone scripts that might have environmental discrepancies.
