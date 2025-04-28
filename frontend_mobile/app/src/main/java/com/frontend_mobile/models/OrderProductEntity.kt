package com.frontend_mobile.models

import android.os.Parcelable
import kotlinx.parcelize.Parcelize

@Parcelize
data class OrderProductEntity(
    val productId: String,
    val product: String,
    val quantity: Int,
    val price: Double,

) : Parcelable
