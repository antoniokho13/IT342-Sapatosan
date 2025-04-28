package com.frontend_mobile.models

data class AddProductToCartRequest(
    val productId: String,
    val quantity: Int
)