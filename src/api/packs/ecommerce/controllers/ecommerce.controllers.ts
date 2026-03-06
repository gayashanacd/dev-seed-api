import { createGetAllController } from "../../../shared/controllers/base.controller"
import {
    productsService,
    categoriesService,
    reviewsService,
    ordersService,
    cartService,
    couponsService
} from "../services/ecommerce.services"

// Relations map: pass raw data, not paginated
const productRelations = {
    category: categoriesService.getAllData(),
    reviews: reviewsService.getAllData()
}

export const getProducts = createGetAllController(productsService, productRelations)
export const getCategories = createGetAllController(categoriesService)
export const getReviews = createGetAllController(reviewsService)
export const getOrders = createGetAllController(ordersService)
export const getCart = createGetAllController(cartService)
export const getCoupons = createGetAllController(couponsService)