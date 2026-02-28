
const Features = () => {
    return (
        <section className="py-16">
        <div className="container mx-auto px-6">

            <h2 className="text-3xl font-bold text-center mb-12">
                Why DevSeed API?
            </h2>

            <div className="grid md:grid-cols-3 gap-8">

            <div className="border p-6 rounded shadow-sm">
                <h3 className="font-semibold text-lg mb-2">
                    Domain Based Data
                </h3>
                <p className="text-gray-600">
                    Instead of generic data, DevSeed API provides realistic
                    datasets such as e-commerce products, users, orders,
                    and more.
                </p>
            </div>

            <div className="border p-6 rounded shadow-sm">
                <h3 className="font-semibold text-lg mb-2">
                    Built for Frontend Developers
                </h3>
                <p className="text-gray-600">
                    Easily test UI components, dashboards, and forms using
                    realistic API responses.
                </p>
            </div>

            <div className="border p-6 rounded shadow-sm">
                <h3 className="font-semibold text-lg mb-2">
                    Flexible Querying
                </h3>
                <p className="text-gray-600">
                    APIs support pagination, search, filtering, and sorting
                    to simulate real production APIs.
                </p>
            </div>

            </div>
        </div>
        </section>
    )
}

export default Features