import { Link } from "react-router-dom"
import { Helmet } from "react-helmet"

const Hero = () => {
    return (
        <>
            {/* SEO Meta Tags */}
            <Helmet>
                <title>DevSeed API – Realistic Mock APIs for Frontend Developers</title>
                <meta
                    name="description"
                    content="DevSeed API provides realistic, domain-specific mock APIs for frontend developers to build and test applications without a real backend. Includes users, products, e-commerce data, filtering, sorting, and pagination."
                />
                <meta name="robots" content="index, follow" />

                {/* Structured Data */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": "DevSeed API",
                        "url": "https://www.devseedapi.com",
                        "applicationCategory": "Developer Tools",
                        "operatingSystem": "Web",
                        "description": "Realistic mock APIs for frontend developers to build and test apps without a backend. Includes users, products, e-commerce data, filtering, sorting, and pagination."
                    })}
                </script>
            </Helmet>

            {/* Hero Section */}
            <section className="bg-gray-50 py-20 dark:bg-gray-900 dark:text-gray-100">
                <div className="container mx-auto px-6 text-center">

                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Realistic Mock APIs for Frontend Developers
                    </h1>

                    <p className="text-xl text-gray-700 mb-4 dark:text-gray-300">
                        Prebuilt, domain-specific datasets for users, products, and e-commerce to accelerate development and testing.
                    </p>

                    <p className="text-gray-600 max-w-2xl mx-auto mb-8 dark:text-gray-400">
                        Why choose DevSeed API? Unlike generic mock APIs, we provide <strong>realistic data structures</strong>, built-in <strong>filtering, sorting, and pagination</strong>, so you can test your frontend exactly like production.
                    </p>
                
                    <div className="space-x-4">
                        <Link
                            to="/docs/core/users"
                            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
                        >
                            View API Docs
                        </Link>

                        <Link
                            to="/docs/core/users#try-api"
                            className="border px-6 py-3 rounded hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800"
                        >
                            Try API
                        </Link>
                    </div>

                </div>
            </section>
        </>
    )
}

export default Hero