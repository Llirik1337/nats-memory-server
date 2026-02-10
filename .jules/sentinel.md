# Sentinel's Journal

## 2026-02-10 - Zip Slip / Path Traversal in File Download
**Vulnerability:** The `downloadFile` function blindly trusted the `Content-Disposition` header's filename, allowing an attacker (or compromised server) to overwrite arbitrary files on the system via path traversal characters (e.g., `../../../etc/passwd`).
**Learning:** `path.resolve` treats `..` components as directory traversal instructions, even if they originate from untrusted string input. Native `split` on headers is insufficient for security.
**Prevention:** Always sanitize filenames from external sources using `path.basename()` to strip directory components. Additionally, verify that the final resolved path lies within the intended target directory using `path.relative()` checks.
