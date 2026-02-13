## 2025-02-12 - Path Traversal in File Download
**Vulnerability:** The `downloadFile` function blindly trusted the `Content-Disposition` header filename from the server, allowing path traversal attacks if a malicious server or URL was configured.
**Learning:** Never trust input from external sources, even from headers like `Content-Disposition`. Developers often overlook filename sanitization when downloading files, assuming the URL source is trusted or benign.
**Prevention:** Always sanitize filenames using `path.basename()` before using them in file system operations. Ensure the resolved path is within the intended directory using `path.resolve` and checking if it starts with the target directory path.
