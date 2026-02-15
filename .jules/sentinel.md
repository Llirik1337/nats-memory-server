## 2026-02-15 - [Path Traversal in File Download]
**Vulnerability:** The `downloadFile` utility extracted filenames from the `Content-Disposition` header using simple string splitting and used them directly in `path.resolve` without sanitization. This allowed a malicious server (or compromised URL) to write files outside the intended directory using path traversal characters (e.g., `filename=../../etc/passwd`).
**Learning:** Never trust filenames provided by external sources, including HTTP headers. `path.resolve` resolves `..` segments, which can escape the intended directory.
**Prevention:** Always sanitize filenames (e.g., using `path.basename`) and validate that the resolved destination path resides within the intended target directory before writing files.
