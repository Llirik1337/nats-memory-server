import { downloadFile } from './download-file';
import fetch from 'make-fetch-happen';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';

// Mock make-fetch-happen
jest.mock(`make-fetch-happen`, () => jest.fn());

// Mock fs module partially
jest.mock(`fs`, () => ({
  createWriteStream: jest.fn(),
  promises: {
    readFile: jest.fn(),
  },
}));

// Mock stream/promises
jest.mock(`stream/promises`, () => ({
  pipeline: jest.fn(),
}));

describe(`downloadFile Security`, () => {
  const mockFetch = fetch as unknown as jest.Mock;
  const mockCreateWriteStream = fs.createWriteStream as unknown as jest.Mock;
  const mockPipeline = pipeline as unknown as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it(`should sanitize path traversal attempts via Content-Disposition filename`, async () => {
    const url = `http://example.com/malicious.zip`;
    const dir = path.resolve(`/tmp/safe-dir`);
    const maliciousFilename = `../../etc/passwd`;

    // Setup the mock response with malicious filename
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
    mockCreateWriteStream.mockReturnValue({});
    mockPipeline.mockResolvedValue(undefined);

    const result = await downloadFile(url, dir);

    // With basename sanitization, ../../etc/passwd becomes passwd
    const expectedPath = path.resolve(dir, `passwd`);

    expect(result).toBe(expectedPath);
    expect(result.startsWith(dir)).toBe(true);
  });

  it(`should reject filenames that resolve outside the target directory (e.g., "..")`, async () => {
    const url = `http://example.com/malicious.zip`;
    const dir = path.resolve(`/tmp/safe-dir`);
    const maliciousFilename = `..`;

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
    mockCreateWriteStream.mockReturnValue({});
    mockPipeline.mockResolvedValue(undefined);

    await expect(downloadFile(url, dir)).rejects.toThrow(
      `Invalid filename: Path traversal detected`,
    );
  });
});
