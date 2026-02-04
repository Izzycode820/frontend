'use server';

import { cookies } from 'next/headers';

/**
 * Verifies the Beta Access password.
 * If correct, sets a session cookie to allow access to the encrypted routes.
 */
export async function verifyBetaPassword(password: string) {
    const correctPassword = process.env.BETA_PASSWORD;

    if (!correctPassword) {
        console.error("BETA_PASSWORD environment variable is not set!");
        return { success: false, message: "System configuration error." };
    }

    if (password === correctPassword) {
        // Set cookie valid for 7 days
        (await cookies()).set('beta_token', 'authorized', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 1 week
        });

        return { success: true };
    }

    return { success: false, message: "Incorrect password." };
}
