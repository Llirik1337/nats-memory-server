import { downloadFile } from './download-file';
import fetch from 'make-fetch-happen';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';

jest.mock(`make-fetch-happen`);
jest.mock(`fs`);
jest.mock(`stream/promises`);

// We do NOT mock path here to test actual path resolution
// or we can just inspect what path.resolve receives if we mock it.
// But to be 100% sure about "traversal", using real path is better.
// However, the original test mocks it.
// Let's mock path but check arguments to ensure sanitization.

describe(`downloadFile Security`, () => {
  const mockFetch = fetch as unknown as jest.Mock;
  const mockPipeline = pipeline as unknown as jest.Mock;
  const mockCreateWriteStream = fs.createWriteStream as unknown as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it(`should prevent path traversal in filename`, async () => {
    const url = `http://example.com/malicious.zip`;
    const dir = `./downloads`;

    // Malicious filename attempting to traverse up
    const maliciousFilename = `../../../../etc/passwd`;

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

    // We expect the function to either throw or sanitize the path.
    // If it uses path.resolve(dir, maliciousFilename), the result will be outside dir.

    // We can spy on fs.createWriteStream to see where it tries to write.

    await downloadFile(url, dir);

    const writeCall = mockCreateWriteStream.mock.calls[0];
    const destinationPath = writeCall[0];

    // Check if the destination path ends with the malicious traversal
    // With real path.resolve, it would be resolved.
    // But since we are importing the module which imports 'path',
    // and we haven't mocked 'path' in THIS test file (only in the other one),
    // it should use the real path module.

    const resolvedDir = path.resolve(dir);
    // verification: destination should be inside resolvedDir

    // If vulnerable, destinationPath will be /etc/passwd (or relative equivalent)
    // If secure, it should be resolvedDir/passwd

    console.log(`Destination:`, destinationPath);
    console.log(`Resolved Dir:`, resolvedDir);

    const isChild = (destinationPath as string).startsWith(resolvedDir);
    if (!isChild) {
      throw new Error(
        `Path traversal detected! Wrote to ${String(
          destinationPath,
        )} which is not inside ${resolvedDir}`,
      );
    }
    expect(isChild).toBe(true);
  });
});
