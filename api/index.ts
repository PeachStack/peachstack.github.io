import { buildApp } from "../server";
import { initDb } from "../src/server/db";

// Singleton promise — all concurrent cold-start requests share the same
// initialization flight instead of each spawning their own initDb() call.
let initPromise: Promise<(req: any, res: any) => void> | null = null;

function getHandler(): Promise<(req: any, res: any) => void> {
  if (!initPromise) {
    initPromise = (async () => {
      await initDb();
      return await buildApp();
    })().catch((err) => {
      // Reset so the next request can retry initialisation.
      initPromise = null;
      throw err;
    });
  }
  return initPromise;
}

export default async function apiHandler(req: any, res: any) {
  try {
    const h = await getHandler();
    h(req, res);
  } catch (err: any) {
    console.error('[API init error]', err?.message || err);
    if (!res.headersSent) {
      res.status(503).json({ message: 'Service temporarily unavailable. Please try again in a moment.' });
    }
  }
}
