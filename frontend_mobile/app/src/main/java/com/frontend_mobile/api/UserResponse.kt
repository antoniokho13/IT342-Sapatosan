package com.frontend_mobile.api

data class UserResponse(
    val id: String,
    val firstName: String,
    val lastName: String,
    val email: String,
    val role: String // Include the user's role
)