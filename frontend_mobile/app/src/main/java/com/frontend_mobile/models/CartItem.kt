package com.frontend_mobile.models

import android.os.Parcelable
import kotlinx.parcelize.Parcelize

@Parcelize
data class CartItem(
    val id: String = "",
    val name: String = "",
    val product: String = "",
    val price: Double = 0.0,
    val size: String = "",
    val quantity: Int = 0,
    val imageUrl: String = "",
    val brand: String = "",
    val stock: Int = 0,
    val productId: String,
    var selectedSize: String,
    var selectedQuantity: Int,
    var isSelected: Boolean = false,
) : Parcelable
