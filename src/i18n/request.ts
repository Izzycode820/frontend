import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
    // Read the locale from the cookie or default to 'en'
    const cookieStore = await cookies();
    const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en';

    // Import both settings and dashboard messages
    const [settings, dashboard] = await Promise.all([
        import(`./../messages/settings/${locale}.json`),
        import(`./../messages/dashboard/${locale}.json`)
    ]);

    return {
        locale,
        messages: {
            ...settings.default,
            ...dashboard.default
        }
    };
});
