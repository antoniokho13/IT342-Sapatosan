package com.frontend_mobile.models

import android.os.Parcelable
import kotlinx.parcelize.Parcelize
import java.util.Date

@Parcelize
data class OrderEntity(
    var id: String? = null,
    var userId: String? = null,
    var orderDate: Date? = null,
    var totalAmount: Double? = null,
    var status: String? = null,
    var orderProductIds: List<String>? = null,
    var paymentId: String? = null,
    var paymentStatus: PaymentStatus? = null,
    var firstName: String? = null,
    var lastName: String? = null,
    var email: String? = null,
    var address: String? = null,
    var postalCode: String? = null,
    var country: String? = null,
    var contactNumber: String? = null,
): Parcelable

enum class PaymentStatus{
    PENDING, PAID, UNPAID
}