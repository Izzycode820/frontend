import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Blog',
    description: 'Huzilerz Camp Blogs - Coming Soon',
}

export default function BlogPage() {
    return (
        <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
            <div className="text-center">
                <h1 className="text-2xl font-medium text-foreground">
                    Huzilerz Camp Blogs
                </h1>
                <p className="text-muted-foreground mt-2">
                    Coming Soon
                </p>
            </div>
        </section>
    )
}
