import { createWriteStream } from 'fs';
import path from 'path';
import fetch from 'make-fetch-happen';
import { pipeline } from 'stream/promises';

const CONTENT_DISPOSITION_KEY = `content-disposition`;

export interface DownloadFileOptions {
  httpProxy?: string;
  httpsProxy?: string;
  noProxy?: string;
}

export async function downloadFile(
  url: string,
  dir = `./`,
  options: DownloadFileOptions = {},
): Promise<string> {
  const proxy = url.startsWith(`https:`)
    ? options.httpsProxy
    : options.httpProxy;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fetchOptions: any = {};

  if (proxy != null) {
    fetchOptions.proxy = proxy;
  }
  if (options.noProxy != null) {
    fetchOptions.noProxy = options.noProxy;
  }

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.statusText}`);
  }

  const rawFileName = response.headers
    .get(CONTENT_DISPOSITION_KEY)
    ?.split(`filename=`)?.[1];

  if (rawFileName == null) {
    throw new Error(`No filename in content-disposition`);
  }

  const fileName = path.basename(rawFileName.replace(/^"|"$/g, ``));
  const destination = path.resolve(dir, fileName);

  // Prevention of Path Traversal
  if (!destination.startsWith(path.resolve(dir))) {
    throw new Error(`Invalid file path`);
  }
  const fileStream = createWriteStream(destination);

  await pipeline(response.body, fileStream);

  return destination;
}
