
import { Link } from "react-router-dom"

const Hero = () => {
    return (
        <section className="bg-gray-50 py-20 dark:bg-gray-900 dark:text-gray-100">
        <div className="container mx-auto px-6 text-center">

            <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Domain-Based Mock APIs for Developers
            </h1>

            <p className="text-gray-600 max-w-2xl mx-auto mb-8 dark:text-gray-300">
                DevSeed API provides realistic domain datasets like users,
                e-commerce products, and more to help developers build and
                test frontend applications without a real backend.
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
                    className="border px-6 py-3 rounded hover:bg-gray-100"
                    >
                    Try API
                </Link>
            </div>

        </div>
        </section>
    )
}

export default Hero