import net from 'net';

export async function getFreePort(): Promise<number> {
  return await new Promise<number>((resolve) => {
    const srv = net.createServer();
    srv.listen(0, () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const port = (srv.address() as any).port;
      srv.close(() => {
        resolve(port);
      });
    });
  });
}
