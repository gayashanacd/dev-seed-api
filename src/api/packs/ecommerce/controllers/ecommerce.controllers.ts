// src/api/packs/ecommerce/controllers/ecommerce.controllers.ts
import { createGetAllController } from "../../../shared/controllers/base.controller"
import {
    productsService,
    categoriesService,
    reviewsService,
    ordersService,
    cartService,
    couponsService
} from "../services/ecommerce.services"

export const getProducts = createGetAllController(productsService)
export const getCategories = createGetAllController(categoriesService)
export const getReviews = createGetAllController(reviewsService)
export const getOrders = createGetAllController(ordersService)
export const getCart = createGetAllController(cartService)
export const getCoupons = createGetAllController(couponsService)