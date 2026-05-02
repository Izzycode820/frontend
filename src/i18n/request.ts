import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
    // Read the locale from the cookie or default to 'en'
    const cookieStore = await cookies();
    const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en';

    // Import settings, dashboard, dashboard2, platform, whatsapp and workman messages
    const [settings, dashboard, dashboard2, platform, whatsapp, workman] = await Promise.all([
        import(`./../messages/settings/${locale}.json`),
        import(`./../messages/dashboard/${locale}.json`),
        import(`./../messages/dashboard_2/${locale}.json`),
        import(`./../messages/platform/${locale}.json`),
        import(`./../messages/whatsapp/${locale}.json`),
        import(`./../messages/workman/${locale}.json`)
    ]);

    return {
        locale,
        messages: {
            ...settings.default,
            ...dashboard.default,
            ...dashboard2.default,
            ...platform.default,
            ...whatsapp.default,
            ...workman.default
        }
    };
});
