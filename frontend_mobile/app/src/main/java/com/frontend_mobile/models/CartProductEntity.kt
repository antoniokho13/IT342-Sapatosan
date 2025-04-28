package com.frontend_mobile.models

import android.os.Parcelable
import kotlinx.parcelize.Parcelize

@Parcelize
data class CartProductEntity(
    var id: String = "",
    var cartId: String = "",
    var productId: String = "",
    var name: String = "",
    var productBrand: String = "",
    var stock: Int = 0,
    var brand: String = "",
    var price: Double = 0.0,
    var size: String = "",
    var imageUrl: String = "",
    var categoryId: String = "",
    var quantity: Int = 0
) : Parcelable