package com.frontend_mobile.models

data class CartEntity(
    val id: String = "",
    val userId: String = "",
    val products: List<ProductDTO> = emptyList(),
    val status: String = ""
)