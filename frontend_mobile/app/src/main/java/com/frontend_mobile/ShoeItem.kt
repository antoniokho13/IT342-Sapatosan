package com.frontend_mobile

data class ShoeItem(
    val name: String,
    val price: String,
    val imageResId: Int, // This will point to the drawable resource
    val category: String
)