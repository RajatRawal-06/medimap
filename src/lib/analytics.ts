import posthog from 'posthog-js';

export const initAnalytics = (): void => {
    const posthogKey = import.meta.env.VITE_POSTHOG_KEY;
    const posthogHost =
        import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';

    if (!posthogKey) return;

    posthog.init(posthogKey, {
        api_host: posthogHost,
        autocapture: true,
        capture_pageview: true,
        persistence: 'localStorage',
    });
};

export const trackEvent = (
    eventName: string,
    properties?: Record<string, unknown>
): void => {
    if (!posthog.__loaded) return;

    posthog.capture(eventName, properties);
};
