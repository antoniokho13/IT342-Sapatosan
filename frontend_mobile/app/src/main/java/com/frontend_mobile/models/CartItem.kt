package com.frontend_mobile.models

import android.os.Parcelable
import kotlinx.parcelize.Parcelize

@Parcelize
data class CartItem(
    val shoe: ShoeItem,
    val selectedSize: String,
    val selectedQuantity: Int
) : Parcelable
