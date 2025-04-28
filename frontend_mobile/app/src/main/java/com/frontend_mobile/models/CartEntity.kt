package com.frontend_mobile.models

data class CartEntity(
    val id: String,
    val userId: String,
    val cartProductIds: Map<String, Int>,
    val status: String
)