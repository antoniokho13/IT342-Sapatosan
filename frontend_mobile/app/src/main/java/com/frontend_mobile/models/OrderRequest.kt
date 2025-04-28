package com.frontend_mobile.models

data class OrderRequest(
    val userId: String, // Changed from String to Long
    val items: List<OrderProductEntity>,
    val totalPrice: Double,
    val shippingAddress: String,
    val paymentMethod: String
)