## 2026-02-12 - [Avoid Unnecessary String Conversion in Hot Paths]
**Learning:** Checking streams for strings via `toString()` and `.includes()` on every chunk is expensive, especially in long-running processes or verbose streams.
**Action:** Use flags to skip processing once a specific state is reached (e.g., `isReady`), and only convert to string when necessary (e.g., `verbose` is true).
