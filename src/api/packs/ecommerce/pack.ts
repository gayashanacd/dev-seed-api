import type { PackDefinition } from "../types"

export const ecommercePack = {
    key: "ecommerce",
    title: "E-Commerce Model",
    label: "E-Commerce",
    basePath: "/ecommerce",
    entities: {
        products: {
            title: "Products",
            description: "Product catalog with filtering and sorting.",
            rangeFilters: {
                minPrice: { field: "price", op: "gte", description: "Minimum price filter" },
                maxPrice: { field: "price", op: "lte", description: "Maximum price filter" }
            },
            relations: {
                category: { entity: "categories" },
                reviews: { entity: "reviews", foreignKey: "productId" }
            },
            filters: [
                { name: "categoryId", type: "string", description: "Filter by category ID" }
            ],
            examples: { filter: "categoryId", sort: "price&order=asc" }
        },
        categories: {
            title: "Categories",
            description: "Product category list.",
            filters: [
                { name: "name", type: "string", description: "Filter by category name" }
            ],
            examples: { filter: "name", sort: "name&order=asc" }
        },
        reviews: {
            title: "Reviews",
            description: "Product reviews.",
            filters: [
                { name: "productId", type: "string", description: "Filter by product ID" },
                { name: "userId", type: "string", description: "Filter by user ID" },
                { name: "rating", type: "number", description: "Filter by rating" }
            ],
            examples: { filter: "productId", sort: "rating&order=desc" }
        },
        orders: {
            title: "Orders",
            description: "User order history.",
            filters: [
                { name: "userId", type: "string", description: "Filter by user ID" },
                { name: "status", type: "string", description: "Order status filter" }
            ],
            examples: { filter: "status", sort: "createdAt&order=desc" }
        },
        cart: {
            title: "Cart",
            description: "User shopping cart.",
            filters: [
                { name: "userId", type: "string", description: "Filter by user ID" }
            ],
            examples: { filter: "userId", sort: "id&order=asc" }
        },
        coupons: {
            title: "Coupons",
            description: "Discount coupon management.",
            filters: [
                { name: "active", type: "boolean", description: "Filter active coupons" },
                { name: "code", type: "string", description: "Filter by coupon code" }
            ],
            examples: { filter: "code", sort: "id&order=asc" }
        }
    }
} satisfies PackDefinition
