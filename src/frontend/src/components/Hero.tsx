import { Link } from "react-router-dom"

const Hero = () => {
    return (
        <>

            {/* Hero Section */}
            <section className="bg-gray-50 py-20 dark:bg-gray-900 dark:text-gray-100">
                <div className="container mx-auto px-6 text-center">

                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Realistic Mock APIs for Frontend Developers
                    </h1>

                    <p className="text-xl text-gray-700 mb-4 dark:text-gray-300">
                        Prebuilt, domain-specific datasets for users, e-commerce, and SaaS apps to accelerate development and testing.
                    </p>

                    <p className="text-gray-600 max-w-2xl mx-auto mb-8 dark:text-gray-400">
                        Why choose DevSeed API? Unlike generic mock APIs, we provide <strong>realistic, related data</strong>, built-in <strong>filtering, sorting, and pagination</strong>, and <strong>simulated writes</strong> (<code>POST</code>, <code>PUT</code>, <code>PATCH</code>, <code>DELETE</code>) with real validation errors, so you can test your frontend exactly like production.
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