# Sentinel Journal

## 2024-02-11 - Path Traversal in File Download
**Vulnerability:** The `downloadFile` utility directly used filenames from `Content-Disposition` headers without sanitization, allowing path traversal attacks via `../../` sequences.
**Learning:** Mocking the `path` module in unit tests masked this vulnerability because the mock didn't implement real path resolution logic. Security-critical file operations should use integration-style tests with real filesystem/path modules to verify path boundaries.
**Prevention:** Always use `path.basename()` on user-provided filenames to strip directory components and verify the resolved destination path is within the expected target directory using `startsWith()` or similar checks.
