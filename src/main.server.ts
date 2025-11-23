/**
 * Server entry point.
 * Bootstraps the Angular application using the server-specific config.
 */
import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { config } from './app/app.config.server';

// Called by Angular's Node engine to start the SSR app for a given request.
const bootstrap = (context: BootstrapContext) =>
  bootstrapApplication(App, config, context);

export default bootstrap;
