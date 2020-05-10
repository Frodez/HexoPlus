import { createServer } from "net";

export async function validPort(port: number): Promise<boolean> {
  const server = createServer().listen(port);
  return new Promise((resolve, reject) => {
    server.on("listening", () => {
      server.close();
      resolve(true);
    });
    server.on("error", (err) => {
      resolve(false);
    });
  });
}
