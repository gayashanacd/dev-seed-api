import Hero from "../components/Hero"
import Features from "../components/Features"
import DomainPacks from "../components/DomainPacks"
import { Helmet } from "react-helmet"

const Home = () => {
    return (
        <>
        {/* SEO Meta Tags for Home Page */}
        <Helmet>
            <title>DevSeed API – Realistic Mock APIs for Frontend Developers</title>
            <meta
            name="description"
            content="DevSeed API provides realistic, domain-specific mock APIs for frontend developers to build and test applications without a backend. Explore users, products, e-commerce data, filtering, sorting, and pagination."
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
                "description": "Realistic mock APIs for frontend developers to build and test apps without a backend. Explore users, products, e-commerce data, filtering, sorting, and pagination."
            })}
            </script>
        </Helmet>

        {/* Page Components */}
        <Hero />
        <Features />
        <DomainPacks />
        </>
    )
}

export default Home