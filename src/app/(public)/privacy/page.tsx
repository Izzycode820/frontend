
import React from 'react';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 py-24 px-6 md:px-12">
            <div className="max-w-4xl mx-auto prose dark:prose-invert">
                <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                    Last updated: January 20, 2026
                </p>

                <section className="mb-8">
                    <h2>1. Introduction</h2>
                    <p>
                        At HUZILERZ, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and share information about you when you use our websites and services in Cameroon.
                    </p>
                </section>

                <section className="mb-8">
                    <h2>2. Information We Collect</h2>
                    <p>
                        We collect information you provide directly to us, such as when you create an account, subscribe to a plan, or contact customer support. This may include:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Account Data:</strong> Name, email address, phone number.</li>
                        <li><strong>Business Data:</strong> Store name, products, and business contact info.</li>
                        <li><strong>Payment Data:</strong> Transaction history and Mobile Money payment status (we do NOT store your PIN or full payment credentials; this is handled by our payment processors).</li>
                        <li><strong>Usage Data:</strong> Information about how you interact with our Service (e.g., pages visited, features used).</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2>3. How We Use Your Information</h2>
                    <p>
                        We use the information we collect to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Provide, maintain, and improve our Service.</li>
                        <li>Process your subscriptions and transactions tailored for Mobile Money.</li>
                        <li>Send you technical notices, updates, security alerts, and support messages.</li>
                        <li>Monitor and analyze trends, usage, and activities in connection with our Service.</li>
                        <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities.</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2>4. Data Sharing</h2>
                    <p>
                        We may share your information in the following circumstances:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>With Service Providers:</strong> We share data with vendors who perform services for us (e.g., payment processors like Fapshi/Notch Pay, hosting providers).</li>
                        <li><strong>Legal Requirements:</strong> We may disclose information if required to do so by Cameroonian law or in response to valid requests by public authorities (e.g., a court or government agency).</li>
                        <li><strong>Business Transfers:</strong> In connection with any merger, sale of company assets, or financing.</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2>5. Data Security</h2>
                    <p>
                        We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction. We use industry-standard encryption for data in transit and at rest.
                    </p>
                </section>

                <section className="mb-8">
                    <h2>6. Your Rights</h2>
                    <p>
                        Depending on your location and applicable laws, you may have the right to access, correct, delete, or export your personal data. You can manage most of your account settings directly within the Dashboard. For other requests, please contact us.
                    </p>
                </section>

                <section className="mb-8">
                    <h2>7. Changes to this Policy</h2>
                    <p>
                        We may update this Privacy Policy from time to time. If we make changes, we will notify you by revising the date at the top of the policy and, in some cases, providing you with additional notice (such as adding a statement to our homepage or sending you a notification).
                    </p>
                </section>

                <section className="mb-8">
                    <h2>8. Contact Us</h2>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us at: <a href="mailto:privacy@huzilerz.com" className="text-blue-600 hover:underline">privacy@huzilerz.com</a>.
                    </p>
                </section>
            </div>
        </div>
    );
}
