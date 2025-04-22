package com.frontend_mobile.models

data class User(
    val id: String = "",
    val firstName: String = "",
    val lastName: String = "",
    val email: String = "",
    val password: String = "", // You might exclude this field from being stored locally
    val role: String = "USER" // Optional: differentiate admin, user, etc.
)
