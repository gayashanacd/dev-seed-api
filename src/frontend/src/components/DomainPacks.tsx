const DomainPacks = () => {
    const packs = [
        {
            title: "Users",
            description: "User profiles with roles, emails, and timestamps.",
            endpoint: "/api/v1/users",
            comingSoon: false,
        },
        {
            title: "E-Commerce",
            description:
                "Products, categories, and inventory datasets for building e-commerce applications.",
            endpoint: "/api/v1/products",
            comingSoon: false,
        },
        {
            title: "Fake SaaS / Startup Data",
            description:
                "Simulated SaaS accounts, subscriptions, and startup data for prototyping dashboards.",
            comingSoon: true,
        },
        {
            title: "Social Media Mock",
            description:
                "Posts, comments, and user interactions to simulate social networks.",
            comingSoon: true,
        },
        {
            title: "EdTech Mock",
            description:
                "Students, courses, grades, and quizzes for education-related applications.",
            comingSoon: true,
        },
        {
            title: "FinTech Mock",
            description:
                "Accounts, transactions, and financial operations for fintech app prototyping.",
            comingSoon: true,
        },
    ];

    return (
        <section className="bg-gray-50 py-16 dark:bg-gray-900">
        <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">
            Available Domain Packs
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
            {packs.map((pack) => (
                <div
                key={pack.title}
                className={`border rounded p-6 relative ${
                    pack.comingSoon ? "opacity-70" : ""
                }`}
                >
                <h3 className="font-semibold text-lg mb-2 dark:text-gray-100">{pack.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 ">{pack.description}</p>

                {!pack.comingSoon && (
                    <div className="mt-3 text-sm text-blue-600">{pack.endpoint}</div>
                )}

                {pack.comingSoon && (
                    <span className="absolute top-3 right-3 bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded-full font-semibold">
                    Coming Soon
                    </span>
                )}
                </div>
            ))}
            </div>
        </div>
        </section>
    );
};

export default DomainPacks;