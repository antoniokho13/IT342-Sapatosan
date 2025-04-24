package com.frontend_mobile.models

data class User(
    val id: String? = null,
    val firstName: String = "",
    val lastName: String = "",
    val email: String = "",
    val password: String? = null, // You might exclude this field from being stored locally
    val role: String = "USER" // Optional: differentiate admin, user, etc.
)
