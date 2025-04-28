package com.frontend_mobile.models

data class ProductDTO(
    val id: String,
    val name: String,
    val brand: String,
    val price: Double,
    val stock: Int,
    val imageUrl: String,
    val categoryId: String,
    val quantity: Int  // ✅ Include quantity here!
)
