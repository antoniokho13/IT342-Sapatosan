// ApiService.kt
package com.frontend_mobile.api

import com.frontend_mobile.models.User
import com.frontend_mobile.models.ShoeItem
import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.POST
import retrofit2.http.GET
import retrofit2.http.PUT
import retrofit2.http.Path

data class RegisterRequest(
    val firstName: String,
    val lastName: String,
    val email: String,
    val password: String,
    val role: String = "USER" // Default role is "USER"
)

data class LoginRequest(
    val email: String,
    val password: String
)

data class ApiResponse(
    val success: Boolean,
    val message: String
)

interface ApiService {
    @POST("/api/users")
    fun registerUser(@Body request: RegisterRequest): Call<ApiResponse>

    @POST("/api/auth/login")
    fun loginUser(@Body request: LoginRequest): Call<LoginResponse>

    @GET("/api/users/{id}")
    fun getUserDetails(@Path("id") userId: String): Call<User>

    @PUT("/api/users/{id}")
    fun updateUserDetails(@Path("id") userId: String, @Body user: User): Call<ApiResponse>

    @GET("/api/products")
    fun getProducts(): Call<List<ShoeItem>>
}
