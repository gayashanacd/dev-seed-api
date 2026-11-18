import type { PackData } from "../router"
import type { ecommercePack } from "./pack"
import products from "./data/products.json"
import categories from "./data/categories.json"
import reviews from "./data/reviews.json"
import orders from "./data/orders.json"
import cart from "./data/cart.json"
import coupons from "./data/coupons.json"

export const ecommerceData = {
    products,
    categories,
    reviews,
    orders,
    cart,
    coupons
} satisfies PackData<keyof typeof ecommercePack.entities>
