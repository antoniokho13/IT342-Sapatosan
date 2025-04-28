// ApiService.kt
package com.frontend_mobile.api

import com.frontend_mobile.models.CartEntity
import com.frontend_mobile.models.CartItem
import com.frontend_mobile.models.OrderRequest
import com.frontend_mobile.models.ProductDTO
import com.frontend_mobile.models.User
import com.frontend_mobile.models.ShoeItem
import okhttp3.Response
import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.POST
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.PATCH
import retrofit2.http.PUT
import retrofit2.http.Path
import retrofit2.http.Query

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

data class LoginResponse(
    val token: String,
    val userId: String,
    val email: String,
    val role: String
)

data class CartResponse(
    val id: String,
    val userId: String,
    val products: List<CartItem>
)

data class UserRequest(
    val email: String,
    val password: String
)

data class UserResponse(
    val id: String,
    val firstName: String,
    val lastName: String,
    val email: String,
    val role: String // Include the user's role
)


interface ApiService {
    //LOGIN
    @POST("/api/users")
    fun registerUser(@Body request: RegisterRequest): Call<ApiResponse>

    @POST("/api/auth/login")
    fun loginUser(@Body request: LoginRequest): Call<LoginResponse>

    @GET("/api/users/{id}")
    fun getUserDetails(@Path("id") userId: String): Call<User>

    @PUT("/api/users/{id}")
    fun updateUserDetails(@Path("id") userId: String, @Body user: User): Call<ApiResponse>
    //PRODUCTS
    @GET("/api/products")
    fun getProducts(): Call<List<ShoeItem>>
    //CART
    @GET("/api/carts/{id}")
    fun getCartById(@Path("id") cartId: String): Call<CartEntity>

    @POST("/api/carts")
    fun createCart(@Body cart: CartEntity): Call<Void>

    @POST("/api/carts/{userId}/add-product")
    fun addProductToCart(
        @Path("userId") userId: String,
        @Query("productId") productId: String,
        @Query("quantity") quantity: Int
    ): Call<ApiResponse>

    @PUT("/api/carts/{id}")
    fun updateCart(@Path("id") cartId: String, @Body updatedCart: CartEntity): Call<Void>

    @DELETE("/api/carts/{id}")
    fun deleteCart(@Path("id") cartId: String): Call<Void>

    @DELETE("/api/carts/{id}")
    fun clearCart(@Path("id") cartId: String): Call<Void>

    @POST("/api/orders")
    fun createOrder(@Body order: OrderRequest): Call<Void>

    // Update existing commented-out endpoints to match your controller
    @PUT("/api/orders/{orderId}/payment/{paymentId}")
    fun associatePaymentWithOrder(
        @Path("orderId") orderId: String,
        @Path("paymentId") paymentId: String
    ): Call<Void>

    @PUT("/api/orders/{orderId}")
    fun updateOrder(
        @Path("orderId") orderId: String,
        @Body updatedOrder: OrderRequest
    ): Call<Void>

    @DELETE("/api/orders/{orderId}")
    fun cancelOrder(@Path("orderId") orderId: String): Call<Void>

    @PATCH("/api/orders/{orderId}")
    fun updateOrderStatus(
        @Path("orderId") orderId: String,
        @Body status: String
    ): Call<Void>
}

