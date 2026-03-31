
import React from 'react';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 py-24 px-6 md:px-12">
            <div className="max-w-4xl mx-auto prose dark:prose-invert">
                <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                    Last updated: January 20, 2026
                </p>

                <section className="mb-8">
                    <h2>1. Introduction</h2>
                    <p>
                        Welcome to HUZILERZ. These Terms of Service ("Terms") constitute a legally binding agreement between you and <strong className="text-black dark:text-white">Steve Akum Abo</strong> (Sole Proprietor), operating under the brand name HUZILERZ, and governed by the laws of the Republic of Cameroon and the OHADA Uniform Acts.
                    </p>
                    <p>
                        By accessing or using our website, mobile application, and software-as-a-service platform (collectively, the "Service"), you agree to be bound by these Terms.
                    </p>
                </section>

                <section className="mb-8">
                    <h2>2. Service Description</h2>
                    <p>
                        HUZILERZ provides an e-commerce and business management platform designed for entrepreneurs in Cameroon. Our services include:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Website building and hosting tools.</li>
                        <li>Order management and inventory tracking.</li>
                        <li>Integration with local payment methods (Mobile Money).</li>
                        <li>Business education and resources.</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2>3. Account Registration</h2>
                    <p>
                        To use certain features of the Service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to keep your account information up to date.
                    </p>
                    <p>
                        You are responsible for safeguarding your password. You agree not to disclose your password to any third party and to take sole responsibility for any activities or actions under your account.
                    </p>
                </section>

                <section className="mb-8">
                    <h2>4. Payments and Subscriptions</h2>
                    <p>
                        <strong>Fees:</strong> We offer both free and paid subscription tiers ("Side Hustler", "Boss", "Enterprise"). Fees are billed in XAF (CFA Francs BEAC).
                    </p>
                    <p>
                        <strong>Payment Methods:</strong> We accept payments via MTN Mobile Money and Orange Money through secure third-party gateways (e.g., Fapshi, Notch Pay). We do not store your mobile money PINs or sensitive payment credentials.
                    </p>
                    <p>
                        <strong>Refunds:</strong> Subscriptions are non-refundable generally, but exceptions may be made in cases of technical error at our sole discretion.
                    </p>
                </section>

                <section className="mb-8">
                    <h2>5. User Content</h2>
                    <p>
                        You retain ownership of the content (products, images, text) you upload to your HUZILERZ store. However, you grant us a worldwide, royalty-free license to host, store, and display your content solely for the purpose of providing the Service.
                    </p>
                    <p>
                        You represent and warrant that you have all necessary rights to the content you post and that it does not violate any third-party rights or applicable laws in Cameroon.
                    </p>
                </section>

                <section className="mb-8">
                    <h2>6. Acceptable Use</h2>
                    <p>
                        You agree not to use the Service for any illegal purpose, including but not limited to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Selling illegal or prohibited goods under Cameroonian law.</li>
                        <li>Engaging in fraudulent activities or scams.</li>
                        <li>Distributing malware or viruses.</li>
                        <li>Attempting to interfere with the proper functioning of the Service.</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2>7. Limitation of Liability</h2>
                    <p>
                        To the maximum extent permitted by applicable law, HUZILERZ shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues as a result of using the platform.
                    </p>
                    <p>
                        We do not guarantee that the Service will be uninterrupted, secure, or error-free.
                    </p>
                </section>

                <section className="mb-8">
                    <h2>8. Governing Law</h2>
                    <p>
                        These Terms shall be governed by and construed in accordance with the laws of the Republic of Cameroon and applicable OHADA Uniform Acts, without regard to its conflict of law provisions.
                    </p>
                </section>

                <section className="mb-8">
                    <h2>9. Contact Us</h2>
                    <p className="space-y-1">
                        If you have any questions about these Terms, please contact us at:<br/>
                        <strong>Legal Entity:</strong> Steve Akum Abo<br/>
                        <strong>Email:</strong> <a href="mailto:support@huzilerz.com" className="text-blue-600 hover:underline">support@huzilerz.com</a>
                    </p>
                </section>
            </div>
        </div>
    );
}
