import os from 'os';

const platformMap: Record<string, string> = {
  win32: `windows`,
};

export function getPlatform(): string {
  const osPlatform = os.platform();
  return platformMap[osPlatform] ?? osPlatform;
}
