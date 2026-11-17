import { Link } from "react-router-dom"

const NotFound = () => (
    <main className="container mx-auto px-6 py-24 text-center">
        <h1 className="text-4xl font-bold mb-4">Page not found</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
            The page you are looking for doesn't exist or has moved.
        </p>
        <div className="space-x-4">
            <Link to="/" className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700">
                Go home
            </Link>
            <Link
                to="/docs/core/users"
                className="border px-6 py-3 rounded hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800"
            >
                API docs
            </Link>
        </div>
    </main>
)

export default NotFound
