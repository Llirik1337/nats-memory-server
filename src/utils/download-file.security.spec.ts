import { downloadFile } from './download-file';
import fetch from 'make-fetch-happen';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';

jest.mock(`make-fetch-happen`);
jest.mock(`fs`);
jest.mock(`stream/promises`);

// We do NOT mock path here because we want to test the path resolution logic
// jest.mock('path');

describe(`downloadFile - Security Tests`, () => {
  const mockFetch = fetch as unknown as jest.Mock;
  const mockPipeline = pipeline as unknown as jest.Mock;
  const mockCreateWriteStream = fs.createWriteStream as unknown as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it(`should prevent path traversal by sanitizing filename`, async () => {
    const url = `http://example.com/malicious.zip`;
    const dir = `/tmp/safe-dir`;
    const maliciousFilename = `../../../../etc/passwd`;

    // The vulnerable code would resolve to /etc/passwd
    // The fixed code should resolve to /tmp/safe-dir/passwd (basename of maliciousFilename is passwd)

    const mockResponse = {
      ok: true,
      headers: {
        get: jest
          .fn()
          .mockReturnValue(`attachment; filename=${maliciousFilename}`),
      },
      body: `mockBody`,
    };

    mockFetch.mockResolvedValue(mockResponse);
    mockCreateWriteStream.mockReturnValue(`mockWriteStream`);
    mockPipeline.mockResolvedValue(undefined);

    const result = await downloadFile(url, dir);

    // Expect the path to be sanitized
    const safeFilename = path.basename(maliciousFilename);
    const expectedPath = path.resolve(dir, safeFilename);

    expect(result).toBe(expectedPath);
    expect(mockCreateWriteStream).toHaveBeenCalledWith(expectedPath);
  });
});
