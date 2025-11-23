/**
 * Server-side Angular application configuration.
 * Merges the browser configuration with server-specific providers.
 */
import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { serverRoutes } from './app.routes.server';
import { appConfig } from './app.config';

/**
 * Extra providers that are only used on the server.
 */
const serverConfig: ApplicationConfig = {
  providers: [
    // Enable Angular server rendering with the configured server routes.
    provideServerRendering(withRoutes(serverRoutes))
  ]
};

/**
 * Final configuration used when bootstrapping the server-side app.
 */
export const config = mergeApplicationConfig(appConfig, serverConfig);
