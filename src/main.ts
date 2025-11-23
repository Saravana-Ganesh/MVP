/**
 * Browser entry point.
 * Bootstraps the standalone root component using the configured providers.
 */
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
// Required by zone-based change detection.
import 'zone.js';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
