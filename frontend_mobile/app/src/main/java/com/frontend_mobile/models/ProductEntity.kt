package com.frontend_mobile.models

import android.os.Parcelable
import kotlinx.parcelize.Parcelize

@Parcelize
data class ProductEntity(
    val id: String = "",
    val name: String = "",
    val brand: String = "",
    val price: Double = 0.0,
    var stock: Int = 0,
    val imageUrl: String = "",
    val categoryId: String = "",
    var quantity: Int = 1, // Added quantity field
    var size: String? = null // Add size field
) : Parcelable