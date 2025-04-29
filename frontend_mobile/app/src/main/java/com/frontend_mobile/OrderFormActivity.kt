package com.frontend_mobile

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.frontend_mobile.api.RetrofitClient
import com.frontend_mobile.databinding.ActivityOrderFormBinding
import com.frontend_mobile.models.OrderEntity
import com.frontend_mobile.models.ProductEntity
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import org.json.JSONObject // Import JSONObject

class OrderFormActivity : AppCompatActivity() {

    private lateinit var binding: ActivityOrderFormBinding
    private var totalPrice: Double = 0.0
    private var cartItems: ArrayList<ProductEntity> = arrayListOf()
    private val TAG = "OrderFormActivity"
    private var orderId: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityOrderFormBinding.inflate(layoutInflater)
        setContentView(binding.root)

        totalPrice = intent.getDoubleExtra("totalPrice", 0.0)
        cartItems = intent.getParcelableArrayListExtra("cartItems") ?: arrayListOf()
        orderId = intent.getStringExtra("orderId")  // Initialize orderId
        Log.d(TAG, "OrderFormActivity: orderId from intent = $orderId")
        Log.d(TAG, "OrderFormActivity: cartItems size: ${cartItems.size}")

        binding.btnProceed.setOnClickListener {
            submitOrder()
        }
    }

    private fun submitOrder() {
        val userId = RetrofitClient.getUserIdFromPrefs()

        if (userId.isEmpty()) {
            Toast.makeText(this, "User not logged in", Toast.LENGTH_SHORT).show()
            startActivity(Intent(this, LoginActivity::class.java))
            return
        }

        binding.btnProceed.isEnabled = false
        binding.btnProceed.text = "Processing..."

        val firstName = binding.etFirstName.text.toString().trim()
        val lastName = binding.etLastName.text.toString().trim()
        val email = binding.etEmail.text.toString().trim()
        val address = binding.etAddress.text.toString().trim()
        val postalCode = binding.etPostalCode.text.toString().trim()
        val country = binding.etCountry.text.toString().trim()
        val contactNumber = binding.etContactNumber.toString().trim()

        if (userId != null) {
            val orderDetails = OrderEntity(
                userId = userId,
                firstName = firstName,
                lastName = lastName,
                email = email,
                address = address,
                postalCode = postalCode,
                country = country,
                contactNumber = contactNumber
            )

            RetrofitClient.instance.createOrderFromCart(userId, orderDetails)
                .enqueue(object : Callback<String> {
                    override fun onResponse(call: Call<String>, response: Response<String>) {
                        binding.btnProceed.isEnabled = true
                        binding.btnProceed.text = "Place Order"

                        if (response.isSuccessful) {
                            val responseString = response.body() ?: "Order created successfully"
                            Log.d(TAG, "Order creation response: $responseString")
                            Toast.makeText(this@OrderFormActivity, responseString, Toast.LENGTH_SHORT).show()

                            //  Extract orderId (if present)
                            var orderId: String? = null
                            try {
                                // Attempt to parse the response as JSON first
                                val jsonResponse = JSONObject(responseString)
                                if (jsonResponse.has("orderId")) {
                                    orderId = jsonResponse.getString("orderId")
                                    Log.d(TAG, "Extracted orderId from JSON: $orderId")
                                } else {
                                    Log.w(TAG, "OrderId not found in JSON, checking for plain string")
                                    // If "orderId" is not in JSON, assume the entire response is the orderId
                                    orderId = responseString
                                    Log.d(TAG, "Extracted orderId as plain string: $orderId")
                                }

                            } catch (e: Exception) {
                                Log.e(TAG, "Error parsing response as JSON. Assuming plain string: ${e.message}", e)
                                // If parsing as JSON fails, assume the entire response is the orderId
                                orderId = responseString
                                Log.d(TAG, "Extracted orderId as plain string after error: $orderId")
                            }

                            val intent = Intent(this@OrderFormActivity, OrderConfirmationActivity::class.java).apply {
                                putExtra("orderId", orderId)
                                putExtra("totalPrice", totalPrice)
                                putParcelableArrayListExtra("cartItems", ArrayList(cartItems))
                            }
                            startActivity(intent)
                            finish()

                        } else {
                            val errorCode = response.code()
                            val errorBody = response.errorBody()?.string() ?: "Unknown error"
                            Log.e(TAG, "Failed to create order. Code: $errorCode, Error: $errorBody")
                            val errorMessage = when (errorCode) {
                                401 -> "Authentication failed. Please login again."
                                404 -> "Cart not found. Please add items to your cart."
                                400 -> "Invalid order data: $errorBody"
                                500 -> "Server error: $errorBody"
                                else -> "Failed to create order: $errorBody"
                            }
                            Toast.makeText(this@OrderFormActivity, errorMessage, Toast.LENGTH_LONG).show()
                            if (errorCode == 401) {
                                startActivity(Intent(this@OrderFormActivity, LoginActivity::class.java))
                                finish()
                            }
                        }
                    }

                    override fun onFailure(call: Call<String>, t: Throwable) {
                        binding.btnProceed.isEnabled = true
                        binding.btnProceed.text = "Place Order"
                        Log.e(TAG, "Network error when creating order", t)
                        Toast.makeText(
                            this@OrderFormActivity,
                            "Network error: ${t.message}",
                            Toast.LENGTH_LONG
                        ).show()
                    }
                })
        } else {
            Toast.makeText(this, "User ID not found", Toast.LENGTH_SHORT).show()
        }
    }
}