import Fastify from 'fastify';

/**
 * Phase 8 scaffold — local development only.
 * Future: auth (anonymous + OAuth), sync API, optional adhan-js cache on server (ROADMAP 8.4).
 */
const app = Fastify({ logger: true });

app.get('/v1/health', async () => ({ ok: true, service: 'quran-heart-backend', phase: 8 }));

/** Placeholder for anonymous device registration (JWT issuance — not implemented). */
app.post('/v1/auth/anonymous', async () => ({
  token: null,
  message: 'Stub: issue short-lived JWT and store device id after security review.',
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
