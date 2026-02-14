import { downloadFile } from './download-file';
import fetch from 'make-fetch-happen';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';

// Mock dependencies
jest.mock(`make-fetch-happen`);
jest.mock(`stream/promises`);

// Use requireActual to keep real fs methods available for libraries that need them
// but mock createWriteStream for our test
jest.mock(`fs`, () => {
  const originalFs = jest.requireActual(`fs`);
  return {
    ...originalFs,
    createWriteStream: jest.fn(),
    promises: {
      ...originalFs.promises,
      unlink: jest.fn(),
    },
  };
});

describe(`downloadFile Security`, () => {
  const mockFetch = fetch as unknown as jest.Mock;
  const mockPipeline = pipeline as unknown as jest.Mock;
  const mockCreateWriteStream = fs.createWriteStream as unknown as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPipeline.mockResolvedValue(undefined);
    mockCreateWriteStream.mockReturnValue({
      on: jest.fn(),
      once: jest.fn(),
      emit: jest.fn(),
      write: jest.fn(),
      end: jest.fn(),
    });
  });

  it(`should prevent path traversal via Content-Disposition header`, async () => {
    const url = `http://example.com/malicious.zip`;
    const dir = `/tmp/safe-dir`;

    // Malicious filename attempting to traverse up
    const maliciousFilename = `../../../etc/passwd`;

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

    const destination = await downloadFile(url, dir);

    // The function should sanitize the filename to just 'passwd'
    // and resolve to '/tmp/safe-dir/passwd'.
    const expectedDestination = path.resolve(
      dir,
      path.basename(maliciousFilename),
    );

    expect(destination).toBe(expectedDestination);
    expect(destination).not.toContain(`..`); // Double check no traversal chars remain
  });
});
