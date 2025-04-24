package com.frontend_mobile.api

data class LoginResponse(
    val token: String,
    val userId: String,
    val email: String,
    val role: String
)