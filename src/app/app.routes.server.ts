/**
 * Server-only routes configuration for Angular SSR.
 * Here we prerender every incoming path (`**`).
 */
import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    // Match any URL that reaches the SSR entry point.
    path: '**',
    // Render on the server for each request
    renderMode: RenderMode.Server
  }
];
