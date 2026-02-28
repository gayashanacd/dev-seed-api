
const DomainPacks = () => {
    return (
        <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-6">

            <h2 className="text-3xl font-bold text-center mb-12">
                Available Domain Packs
            </h2>

            <div className="grid md:grid-cols-3 gap-8">

            <div className="border rounded p-6">
                <h3 className="font-semibold text-lg mb-2">Users</h3>
                <p className="text-gray-600">
                    User profiles with roles, emails, and timestamps.
                </p>
                <div className="mt-3 text-sm text-blue-600">
                    /api/v1/users
                </div>
            </div>

            <div className="border rounded p-6">
                <h3 className="font-semibold text-lg mb-2">E-Commerce</h3>
                <p className="text-gray-600">
                    Products, categories, and inventory datasets for building
                    e-commerce applications.
                </p>
                <div className="mt-3 text-sm text-blue-600">
                    /api/v1/products
                </div>
            </div>

            <div className="border rounded p-6">
                <h3 className="font-semibold text-lg mb-2">More Coming</h3>
                <p className="text-gray-600">
                    Additional packs like orders, reviews, and analytics
                    will be added soon.
                </p>
            </div>

            </div>
        </div>
        </section>
    )
}

export default DomainPacks