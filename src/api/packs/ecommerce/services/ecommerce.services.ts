import { BaseService } from "../../../shared/services/base.service"
import productsData from "../data/products.json"
import categoriesData from "../data/categories.json"
import reviewsData from "../data/reviews.json"
import ordersData from "../data/orders.json"
import cartData from "../data/cart.json"
import couponsData from "../data/coupons.json"

export const productsService = new BaseService(productsData)
export const categoriesService = new BaseService(categoriesData)
export const reviewsService = new BaseService(reviewsData)
export const ordersService = new BaseService(ordersData)
export const cartService = new BaseService(cartData)
export const couponsService = new BaseService(couponsData)