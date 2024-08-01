import { type IncomingMessage } from 'http';
import http from 'http';
import https from 'https';
import path from 'path';
import { createWriteStream } from 'fs';

const CONTENT_DISPOSITION_KEY = `content-disposition`;

async function get(url: string): Promise<IncomingMessage> {
  const urlObj = new URL(url);

  if (urlObj.protocol === `https:`) {
    return await new Promise<IncomingMessage>((resolve) => {
      https.get(url, resolve);
    });
  } else if (urlObj.protocol === `http:`) {
    return await new Promise<IncomingMessage>((resolve) => {
      http.get(url, resolve);
    });
  }

  throw new Error(`Unknown protocol ${urlObj.protocol}`);
}

function isRedirect(statusCode: number | undefined): boolean {
  return statusCode !== undefined && statusCode >= 300 && statusCode < 400;
}

export async function downloadFile(url: string, dir = `./`): Promise<string> {
  let location = url;
  let response: IncomingMessage | undefined;
  while (response === undefined) {
    const res = await get(location);
    const statusCode = res.statusCode;
    if (isRedirect(statusCode) && typeof res.headers.location === `string`) {
      console.log(`Redirecting to ${res.headers.location}`);
      location = res.headers.location;
      continue;
    } else {
      response = res;
    }
  }

  return await new Promise<string>((resolve) => {
    const fileName =
      response?.headers[CONTENT_DISPOSITION_KEY]?.split(`filename=`)?.[1];

    if (fileName == null) {
      throw new Error(`No filename in content-disposition`);
    }

    const dis = path.resolve(dir, fileName);
    const writeStream = createWriteStream(dis);
    response?.pipe(writeStream);
    response?.on(`end`, () => {
      writeStream.close();
      resolve(dis);
    });
  });
}
