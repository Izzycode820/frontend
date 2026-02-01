export default function JsonLd() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Organization',
                '@id': 'https://huzilerz.com/#organization',
                name: 'HUZILERZ',
                url: 'https://huzilerz.com',
                logo: 'https://huzilerz.com/icons/icon-512x512.png',
                sameAs: [
                    'https://twitter.com/huzilerz', // Replace with actual
                    'https://facebook.com/huzilerz', // Replace with actual
                    'https://instagram.com/huzilerz', // Replace with actual
                ],
                contactPoint: {
                    '@type': 'ContactPoint',
                    telephone: '+237-654-164-316', // Replace with actual
                    contactType: 'customer service',
                    areaServed: 'CM',
                    availableLanguage: ['en', 'fr'],
                },
            },
            {
                '@type': 'SoftwareApplication',
                name: 'HUZILERZ',
                applicationCategory: 'BusinessApplication',
                operatingSystem: 'Web',
                offers: {
                    '@type': 'Offer',
                    price: '0',
                    priceCurrency: 'XAF',
                },
                description: ' For all business owners and upcoming entrepreneurs built in Cameroon for Cameroon.',
                aggregateRating: {
                    '@type': 'AggregateRating',
                    ratingValue: '4.8',
                    ratingCount: '200',
                },
            },
        ],
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    )
}
