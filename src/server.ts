/**
 * Node + Express server entry for Angular SSR.
 * - Serves the built browser assets.
 * - Delegates all other requests to Angular's server renderer.
 */
import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

// Path to the browser build output used for static asset serving.
const browserDistFolder = join(import.meta.dirname, '../browser');

// Standard Express application.
const app = express();
// Angular engine used to render the app on the server.
const angularApp = new AngularNodeAppEngine();

/**
 * Example Express REST API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 */

/**
 * Serve static files (JS, CSS, assets) from the browser bundle.
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Fallback: render the Angular application for any non-static request.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the Express HTTP server when running directly (node server.mjs)
 * or when managed by PM2. The default port is 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI dev-server or serverless platforms.
 */
export const reqHandler = createNodeRequestHandler(app);
