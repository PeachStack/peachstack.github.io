import { buildApp } from "../server";
import { initDb } from "../src/server/db";

let handler: ((req: any, res: any) => void) | null = null;

async function getHandler() {
  if (!handler) {
    await initDb();
    handler = await buildApp();
  }
  return handler!;
}

export default async function apiHandler(req: any, res: any) {
  const h = await getHandler();
  h(req, res);
}
