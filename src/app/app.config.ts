import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';

import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';

import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

import { routes } from './app.routes';

import { authReducer } from './core/auth/store/reducer/auth.reducer';
import { AuthEffects } from './core/auth/store/effects/auth.effects';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { dashboardReducer } from './features/dashboard/store/dashboard.reducer';
import { DashboardEffects } from './features/dashboard/store/dashboard.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    provideZoneChangeDetection({
      eventCoalescing: true,
    }),

    // Preload lazy feature chunks in the background so navigation after
    // sign-in is instant instead of waiting on an on-demand chunk fetch.
    provideRouter(routes, withPreloading(PreloadAllModules)),

    provideStore({
      auth: authReducer,
      dashboard: dashboardReducer,
    }),

    provideEffects([
      AuthEffects,
      DashboardEffects,
    ]),

    provideHttpClient(
      withInterceptors([
        authInterceptor,
      ]),
    ),

    // PrimeNG animations
    provideAnimationsAsync(),

    // PrimeNG theme
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: 'none',
          cssLayer: false,
        },
      },
    }),
  ],
};
