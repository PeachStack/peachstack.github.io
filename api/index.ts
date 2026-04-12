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
  try {
    const h = await getHandler();
    h(req, res);
  } catch (err: any) {
    // If initialization failed, reset so the next request retries cleanly.
    handler = null;
    console.error('[API init error]', err?.message || err);
    if (!res.headersSent) {
      res.status(503).json({ message: 'Service temporarily unavailable. Please try again in a moment.' });
    }
  }
}
