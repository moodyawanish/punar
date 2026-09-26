/**
 * Punar Backend — Entry Point
 *
 * Starts the Punar API server.
 * Modules to be implemented:
 *   - api/        HTTP routes
 *   - analysis/   Repository + migration analysis
 *   - rehearsal/  Rollback rehearsal engine
 *   - compatibility/ Compatibility rules + test runner
 *   - bob/        IBM Bob integration
 *   - reports/    Rollback readiness report generator
 */

import express from 'express';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'punar-backend' });
});

// TODO: mount routers
// app.use('/api/projects',    projectRouter);
// app.use('/api/checks',      checkRouter);
// app.use('/api/rehearsals',  rehearsalRouter);
// app.use('/api/reports',     reportRouter);

app.listen(PORT, () => {
  console.log(`Punar backend running on http://localhost:${PORT}`);
});
