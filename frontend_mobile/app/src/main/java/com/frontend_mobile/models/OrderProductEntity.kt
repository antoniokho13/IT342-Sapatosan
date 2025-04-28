package com.frontend_mobile.models

import android.os.Parcelable
import kotlinx.parcelize.Parcelize

@Parcelize
data class OrderProductEntity(
    val id: String = "",
    val orderId: String = "",
    val productId: String = "",
    val quantity: Int = 0,
    val price: Double = 0.0
) : Parcelable