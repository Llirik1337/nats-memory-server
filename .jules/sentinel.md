## 2024-05-22 - [Path Traversal in Content-Disposition]
**Vulnerability:** The codebase was vulnerable to Path Traversal because it trusted the `filename` parameter from the `Content-Disposition` header without sanitization.
**Learning:** `path.resolve` resolves `../` segments, allowing file writes outside the intended directory if the input filename is malicious.
**Prevention:** Always use `path.basename()` on user-provided filenames before resolving paths, and verify the final path starts with the intended directory using `.startsWith()`.
