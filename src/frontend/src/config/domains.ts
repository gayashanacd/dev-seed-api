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
    baseUrl: string
    entities: Record<string, EntityConfig>
}

// Base simulation fields common to all entities
const simulationFields: FieldConfig[] = [
  { name: "page", type: "number", description: "Page number for pagination" },
  { name: "limit", type: "number", description: "Number of results per page" },
  { name: "search", type: "string", description: "Search by keyword" },
  { 
    name: "filter", 
    type: "string", 
    description: "Filter by specific field" 
  },
  { 
    name: "sort", 
    type: "string", 
    description: "Sort by a specific field" 
  },
  { name: "delay", type: "number (ms)", description: "Simulates network latency" },
  { name: "error", type: "number (HTTP code)", description: "Force a specific HTTP error" },
  { name: "errorRate", type: "number (0–100)", description: "Random API failures by percentage" }
]

// Helper to automatically set default filterBy and sortBy
function addDefaults(fields: FieldConfig[], defaultFilter?: string, defaultSort?: string) {
    return fields.map(f => {
        if (f.name === "filter" && defaultFilter) f.filterBy = defaultFilter
        if (f.name === "sort" && defaultSort) f.sortBy = defaultSort
        return f
    })
}

export const domainConfig: Record<string, Domain> = {
    core: {
        title: "Core System",
        baseUrl: "/api/v1",
        entities: {
            users: {
                title: "Users",
                endpoint: "/users",
                endpointName: "users",
                description: "Returns a list of users. Supports pagination, filtering, sorting and simulation.",
                fields: addDefaults(simulationFields, "role", "firstName&order=asc")
            }
        }
    },

    ecommerce: {
        title: "E-Commerce Model",
        baseUrl: "/api/v1/ecommerce",
        entities: {
        products: {
            title: "Products",
            endpoint: "/ecommerce/products",
            endpointName: "products",
            description: "Product catalog with filtering and sorting.",
            fields: addDefaults([
            ...simulationFields,
            { name: "include", type: "string", description: "Include related data" },
            { name: "categoryId", type: "string", description: "Filter by category ID" },
            { name: "minPrice", type: "number", description: "Minimum price filter" },
            { name: "maxPrice", type: "number", description: "Maximum price filter" }
            ], "categoryId", "price&order=asc")
        },

        categories: {
            title: "Categories",
            endpoint: "/ecommerce/categories",
            endpointName: "categories",
            description: "Product category list.",
            fields: addDefaults([
            ...simulationFields,
            { name: "name", type: "string", description: "Filter by category name" }
            ], "name", "name&order=asc")
        },

        reviews: {
            title: "Reviews",
            endpoint: "/ecommerce/reviews",
            endpointName: "reviews",
            description: "Product reviews.",
            fields: addDefaults([
            ...simulationFields,
            { name: "productId", type: "string", description: "Filter by product ID" },
            { name: "userId", type: "string", description: "Filter by user ID" },
            { name: "rating", type: "number", description: "Filter by rating" }
            ], "productId", "rating&order=desc")
        },

        orders: {
            title: "Orders",
            endpoint: "/ecommerce/orders",
            endpointName: "orders",
            description: "User order history.",
            fields: addDefaults([
            ...simulationFields,
            { name: "userId", type: "string", description: "Filter by user ID" },
            { name: "status", type: "string", description: "Order status filter" }
            ], "status", "createdAt&order=desc")
        },

        cart: {
            title: "Cart",
            endpoint: "/ecommerce/cart",
            endpointName: "cart",
            description: "User shopping cart.",
            fields: addDefaults([
            ...simulationFields,
            { name: "userId", type: "string", description: "Filter by user ID" }
            ], "userId", "id&order=asc")
        },

        coupons: {
            title: "Coupons",
            endpoint: "/ecommerce/coupons",
            endpointName: "coupons",
            description: "Discount coupon management.",
            fields: addDefaults([
            ...simulationFields,
            { name: "active", type: "boolean", description: "Filter active coupons" },
            { name: "code", type: "string", description: "Filter by coupon code" }
            ], "code", "id&order=asc")
        }
        }
    }
}