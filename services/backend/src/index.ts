import Fastify from 'fastify';

/**
 * Phase 8 scaffold — local development only.
 * Future: auth (anonymous + OAuth), sync API, optional adhan-js cache on server (ROADMAP 8.4).
 */
const app = Fastify({ logger: true });

app.get('/v1/health', async () => ({ ok: true, service: 'quran-heart-backend', phase: 8 }));

/** Declares which sync features exist (all no-op until implemented). */
app.get('/v1/sync/status', async () => ({
  ok: true,
  anonymousAuth: 'stub',
  collections: ['surah_progress', 'ayah_memorization', 'bookmark', 'note'],
  encryption: 'planned',
}));

/** Placeholder for anonymous device registration (JWT issuance — not implemented). */
app.post('/v1/auth/anonymous', async () => ({
  token: null,
  message: 'Stub: issue short-lived JWT and store device id after security review.',
}));

/** Placeholder push — validates payload shape only. */
app.post('/v1/sync/push', async (req) => ({
  ok: false,
  accepted: 0,
  message: 'Stub: persist encrypted blobs after auth and schema review.',
  receivedKeys: typeof req.body === 'object' && req.body ? Object.keys(req.body as object).slice(0, 12) : [],
}));

const port = Number(process.env.PORT ?? 8787);
const host = process.env.HOST ?? '0.0.0.0';

app
  .listen({ port, host })
  .then(() => {
    app.log.info(`Listening on http://${host}:${port}`);
  })
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
