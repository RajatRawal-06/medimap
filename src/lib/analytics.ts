import posthog from 'posthog-js';
import * as Sentry from '@sentry/react';

export const initAnalytics = () => {
    // PostHog Initialization
    if (import.meta.env.VITE_POSTHOG_KEY) {
        posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
            api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
            autocapture: true,
            capture_pageview: true,
            persistence: 'localStorage',
        });
    }

    // Sentry Initialization
    if (import.meta.env.VITE_SENTRY_DSN) {
        Sentry.init({
            dsn: import.meta.env.VITE_SENTRY_DSN,
            environment: import.meta.env.PROD ? 'production' : 'development',
            integrations: [
                new Sentry.BrowserTracing(),
                new Sentry.Replay(),
            ],
            // Performance Monitoring
            tracesSampleRate: 1.0,
            // Session Replay
            replaysSessionSampleRate: 0.1,
            replaysOnErrorSampleRate: 1.0,
        });
    }
};

export const trackEvent = (eventName: string, properties?: Record<string, unknown>) => {
    if (posthog.isFeatureEnabled('analytics-enabled')) {
        posthog.capture(eventName, properties);
    }
};
