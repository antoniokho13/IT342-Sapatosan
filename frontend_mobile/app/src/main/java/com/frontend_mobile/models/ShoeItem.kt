package com.frontend_mobile.models

import android.os.Parcelable
import kotlinx.parcelize.Parcelize

@Parcelize
data class ShoeItem(
    val id: String,
    val name: String,
    val brand: String,
    val price: Double,
    val stock: Int,
    val imageUrl: String,
    val categoryId: String
) : Parcelable