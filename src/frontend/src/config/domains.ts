export interface FieldConfig {
    name: string
    type: string
    description: string
    filterBy?: string
    sortBy?: string
}

export interface EntityConfig {
    title: string
    endpoint: string
    endpointName: string
    description: string
    fields: FieldConfig[]
}

export interface Domain {
    title: string
    entities: Record<string, EntityConfig>
}

export const domainConfig: Record<string, Domain> = {
    core: {
        title: "Core System",
        entities: {
        users: {
            title: "Users",
            endpoint: "/users",
            endpointName: "users",
            description: "Returns a list of users. Supports pagination, filtering, sorting and simulation.",
            fields: [
                { name: "page", type: "number", description: "Page number for pagination" },
                { name: "limit", type: "number", description: "Number of results per page" },
                { name: "search", type: "string", description: "Search by first name, last name, or email" },
                { name: "filter", type: "string", description: "Filter users by role (admin or customer)", filterBy: "admin" },
                { name: "sort", type: "string", description: "Sort users by a specific field", sortBy: "firstName&order=asc" },
                // Simulation features
                { 
                    name: "delay", 
                    type: "number (ms)", 
                    description: "Simulates network latency. Delays the response by specified milliseconds." 
                },
                { 
                    name: "error", 
                    type: "number (HTTP code)", 
                    description: "Forces the API to return a specific HTTP error code (e.g., 400, 401, 500)." 
                },
                { 
                    name: "errorRate", 
                    type: "number (0–100)", 
                    description: "Randomly fails requests based on percentage. Example: 20 means 20% failure rate." 
                }
            ]
        }
        }
    },

    ecommerce: {
        title: "E-Commerce Model",
        entities: {
        products: {
            title: "Products",
            endpoint: "/products",
            endpointName: "products",
            description: "Product catalog with filtering and sorting.",
            fields: [
                { name: "page", type: "number", description: "Page number" },
                { name: "limit", type: "number", description: "Results per page" },
                { name: "category", type: "string", description: "Filter by category" },
                { name: "minPrice", type: "number", description: "Minimum price filter" }
            ]
        },

        categories: {
            title: "Categories",
            endpoint: "/categories",
            endpointName: "categories",
            description: "Product category list.",
            fields: [
                { name: "search", type: "string", description: "Search category name" }
            ]
        },

        reviews: {
            title: "Reviews",
            endpoint: "/reviews",
            endpointName: "reviews",
            description: "Product reviews.",
            fields: [
                { name: "productId", type: "number", description: "Filter by product" },
                { name: "rating", type: "number", description: "Filter by rating" }
            ]
        },

        orders: {
            title: "Orders",
            endpoint: "/orders",
            endpointName: "orders",
            description: "User order history.",
            fields: [
                { name: "userId", type: "number", description: "Filter by user" },
                { name: "status", type: "string", description: "Order status" }
            ]
        },

        cart: {
            title: "Cart",
            endpoint: "/cart",
            endpointName: "cart",
            description: "User shopping cart.",
            fields: []
        },

        coupons: {
            title: "Coupons",
            endpoint: "/coupons",
            endpointName: "coupons",
            description: "Discount coupon management.",
            fields: [
                { name: "active", type: "boolean", description: "Filter active coupons" }
            ]
        }
        }
    }
}