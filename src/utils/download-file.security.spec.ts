import { downloadFile } from './download-file';
import fetch from 'make-fetch-happen';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';

jest.mock(`make-fetch-happen`);
jest.mock(`fs`);
jest.mock(`stream/promises`);

describe(`downloadFile Vulnerability`, () => {
  const mockFetch = fetch as unknown as jest.Mock;
  const mockCreateWriteStream = fs.createWriteStream as unknown as jest.Mock;
  const mockPipeline = pipeline as unknown as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPipeline.mockResolvedValue(undefined);
  });

  it(`should prevent path traversal by sanitizing the filename`, async () => {
    const url = `http://attacker.com/evil.zip`;
    const dir = `/safe/dir`;
    // The attacker sends a filename that traverses up directories
    const evilFilename = `../../../etc/passwd`;

    const mockResponse = {
      ok: true,
      headers: {
        get: jest.fn().mockReturnValue(`attachment; filename=${evilFilename}`),
      },
      body: `evil content`,
    };

    mockFetch.mockResolvedValue(mockResponse);
    mockCreateWriteStream.mockReturnValue(`mockWriteStream`);

    // If fixed, this should resolve to /safe/dir/passwd, NOT /etc/passwd
    const sanitizedFilename = `passwd`; // basename of ../../../etc/passwd
    const destination = path.resolve(dir, sanitizedFilename);

    const result = await downloadFile(url, dir);

    expect(result).toBe(destination);
    expect(mockCreateWriteStream).toHaveBeenCalledWith(destination);

    // Verify it does NOT try to write to /etc/passwd
    expect(result).not.toBe(`/etc/passwd`);
    expect(mockCreateWriteStream).not.toHaveBeenCalledWith(
      expect.stringMatching(/\/etc\/passwd$/),
    );
  });
});
