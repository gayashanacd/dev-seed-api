import { createGetAllController } from "../../../shared/controllers/base.controller"
import { Relations } from "../../../shared/utils/include"
import {
    productsService,
    categoriesService,
    reviewsService,
    ordersService,
    cartService,
    couponsService
} from "../services/ecommerce.services"

// Relations map: pass raw data, not paginated.
// Array = one-to-one via `${key}Id`; { data, foreignKey } = one-to-many.
const productRelations: Relations = {
    category: categoriesService.getAllData(),
    reviews: { data: reviewsService.getAllData(), foreignKey: "productId" }
}

export const getProducts = createGetAllController(productsService, productRelations)
export const getCategories = createGetAllController(categoriesService)
export const getReviews = createGetAllController(reviewsService)
export const getOrders = createGetAllController(ordersService)
export const getCart = createGetAllController(cartService)
export const getCoupons = createGetAllController(couponsService)