package com.frontend_mobile.models

data class PaymentEntity(
    val id: String,
    val orderId: String,
    val amount: Double,
    val description: String,
    val status: String = "",  // Default status
    val link: String = ""  // PayMongo URL will be returned
)
