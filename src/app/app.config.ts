/**
 * Global browser-side Angular application configuration.
 * Sets up routing, error handling, change detection, hydration and HTTP.
 */
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';

/**
 * Global application configuration.
 * Configures all Angular providers and features for the application.
 * 
 * Providers:
 * - Error handling: Logs unhandled errors to console
 * - Change detection: Zone-based automatic change detection
 * - Routing: Application routes from app.routes.ts
 * - Hydration: Client-side hydration with event replay (for SSR)
 * - HTTP: HttpClient for making API calls
 * - Animations: Angular Material animations support
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Global error listener for debugging
    provideBrowserGlobalErrorListeners(),
    
    // Zone-based change detection (automatic)
    provideZoneChangeDetection(),
    
    // Application routing
    provideRouter(routes),
    
    // Client-side hydration for SSR support
    provideClientHydration(withEventReplay()),
    
    // HTTP client for API calls
    provideHttpClient(),
    
    // Angular Material animations
    provideAnimations()
  ],
};
