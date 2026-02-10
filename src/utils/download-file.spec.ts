import { downloadFile } from './download-file';
import fs from 'fs';
import path from 'path';
import os from 'os';
import fetch from 'make-fetch-happen';

jest.mock(`make-fetch-happen`);
const mockedFetch = fetch as jest.MockedFunction<typeof fetch>;

describe(`downloadFile`, () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), `nats-memory-server-test-`));
  });

  afterEach(() => {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
    jest.clearAllMocks();
  });

  it(`should download file with simple filename`, async () => {
    mockedFetch.mockResolvedValue({
      ok: true,
      headers: {
        get: () => `attachment; filename="test.txt"`,
      },
      body: {
        [Symbol.asyncIterator]: async function* () {
          yield Buffer.from(`content`);
        },
      },
    } as any);

    const filePath = await downloadFile(`http://example.com`, tmpDir);
    expect(filePath).toBe(path.join(tmpDir, `test.txt`));
    expect(fs.readFileSync(filePath, `utf-8`)).toBe(`content`);
  });

  it(`should sanitize filename with path traversal`, async () => {
    mockedFetch.mockResolvedValue({
      ok: true,
      headers: {
        get: () => `attachment; filename="../../../evil.txt"`,
      },
      body: {
        [Symbol.asyncIterator]: async function* () {
          yield Buffer.from(`evil content`);
        },
      },
    } as any);

    const filePath = await downloadFile(`http://example.com`, tmpDir);
    // Should be sanitized to just 'evil.txt' inside tmpDir
    expect(filePath).toBe(path.join(tmpDir, `evil.txt`));
    expect(fs.readFileSync(filePath, `utf-8`)).toBe(`evil content`);

    // Ensure checking outside directory
    // Note: path.join(tmpDir, '../evil.txt') resolves to the parent of tmpDir.
    // We can't easily check if file exists there without permission issues or interference.
    // But since filePath is correct, we know where it wrote.
  });

  it(`should handle filename without quotes`, async () => {
    mockedFetch.mockResolvedValue({
      ok: true,
      headers: {
        get: () => `attachment; filename=simple.txt`,
      },
      body: {
        [Symbol.asyncIterator]: async function* () {
          yield Buffer.from(`content`);
        },
      },
    } as any);

    const filePath = await downloadFile(`http://example.com`, tmpDir);
    expect(filePath).toBe(path.join(tmpDir, `simple.txt`));
  });

  it(`should throw error if filename is missing`, async () => {
    mockedFetch.mockResolvedValue({
      ok: true,
      headers: {
        get: () => null,
      },
      body: {
        [Symbol.asyncIterator]: async function* () {
          yield Buffer.from(``);
        },
      },
    } as any);

    await expect(downloadFile(`http://example.com`, tmpDir)).rejects.toThrow(
      `No filename in content-disposition`,
    );
  });

  it(`should pass proxy options to fetch`, async () => {
    mockedFetch.mockResolvedValue({
      ok: true,
      headers: {
        get: () => `attachment; filename="proxy.txt"`,
      },
      body: {
        [Symbol.asyncIterator]: async function* () {
          yield Buffer.from(`content`);
        },
      },
    } as any);

    const options = {
      httpProxy: `http://proxy.example.com`,
      httpsProxy: `https://proxy.example.com`,
      noProxy: `localhost`,
    };

    await downloadFile(`http://example.com`, tmpDir, options);

    expect(mockedFetch).toHaveBeenCalledWith(
      `http://example.com`,
      expect.objectContaining({
        proxy: `http://proxy.example.com`,
        noProxy: `localhost`,
      }),
    );

    await downloadFile(`https://example.com`, tmpDir, options);

    expect(mockedFetch).toHaveBeenCalledWith(
      `https://example.com`,
      expect.objectContaining({
        proxy: `https://proxy.example.com`,
        noProxy: `localhost`,
      }),
    );
  });
});
