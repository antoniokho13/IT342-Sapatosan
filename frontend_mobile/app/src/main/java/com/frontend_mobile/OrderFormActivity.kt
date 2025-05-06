package com.frontend_mobile

import android.content.Intent
import android.net.Uri
import android.content.SharedPreferences
import android.os.Bundle
import android.util.Log
import android.widget.ArrayAdapter
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.frontend_mobile.api.RetrofitClient
import com.frontend_mobile.api.UserResponse
import com.frontend_mobile.databinding.ActivityOrderFormBinding
import com.frontend_mobile.models.OrderEntity
import com.frontend_mobile.models.ProductEntity
import com.frontend_mobile.models.User
import com.frontend_mobile.models.PaymentEntity // Import PaymentEntity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import org.json.JSONObject

class OrderFormActivity : AppCompatActivity() {

    private lateinit var binding: ActivityOrderFormBinding
    private lateinit var sharedPreferences: SharedPreferences
    private var totalPrice: Double = 0.0
    private var cartItems: ArrayList<ProductEntity> = arrayListOf()
    private val TAG = "OrderFormActivity"
    private var orderId: String? = null
    private var paymentLink: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityOrderFormBinding.inflate(layoutInflater)
        setContentView(binding.root)

        sharedPreferences = getSharedPreferences("user_details", MODE_PRIVATE)

        totalPrice = intent.getDoubleExtra("totalPrice", 0.0)
        cartItems = intent.getParcelableArrayListExtra("cartItems") ?: arrayListOf()
        orderId = intent.getStringExtra("orderId") // Get orderId from intent
        Log.d(TAG, "OrderFormActivity: orderId from intent = $orderId")
        Log.d(TAG, "OrderFormActivity: cartItems size: ${cartItems.size}")

        setupCountryDropdown()
        loadUserDetails()
        binding.btnProceed.setOnClickListener {
            submitOrder()
        }
    }

    private fun setupCountryDropdown() {
        val countries = arrayOf("Philippines", "United States", "Japan", "South Korea")
        val adapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, countries)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        binding.etCountry.setAdapter(adapter)
    }

    private fun loadUserDetails() {
        val userId = RetrofitClient.getUserIdFromPrefs()  // Get User ID from Shared Prefs

        if (userId.isNullOrEmpty()) {
            Toast.makeText(this, "User not logged in", Toast.LENGTH_SHORT).show()
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
            return
        }

        // Make API call to get user details
        RetrofitClient.instance.getUserDetails(userId).enqueue(object : Callback<User> {
            override fun onResponse(call: Call<User>, response: Response<User>) {
                if (response.isSuccessful) {
                    val user = response.body() // Changed to User
                    if (user != null) {
                        // Pre-fill the EditText fields
                        binding.etFirstName.setText(user.firstName)
                        binding.etLastName.setText(user.lastName)
                        binding.etEmail.setText(user.email)

                        // Disable editing of these fields
                        binding.etFirstName.isEnabled = false
                        binding.etLastName.isEnabled = false
                        binding.etEmail.isEnabled = false
                    } else {
                        Toast.makeText(
                            this@OrderFormActivity,
                            "Failed to retrieve user data",
                            Toast.LENGTH_SHORT
                        ).show()
                        Log.e(TAG, "User data is null")
                    }
                } else {
                    val errorCode = response.code()
                    val errorBody = response.errorBody()?.string() ?: "Unknown error"
                    Log.e(TAG, "Error fetching user data: $errorCode, $errorBody")
                    Toast.makeText(
                        this@OrderFormActivity,
                        "Error fetching user data: $errorBody",
                        Toast.LENGTH_LONG
                    ).show()
                    if (errorCode == 401) {
                        startActivity(Intent(this@OrderFormActivity, LoginActivity::class.java));
                        finish();
                    }
                }
            }

            override fun onFailure(call: Call<User>, t: Throwable) {
                Log.e(TAG, "Network error fetching user data", t)
                Toast.makeText(this@OrderFormActivity, "Network error: ${t.message}", Toast.LENGTH_LONG)
                    .show()
            }
        })
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
        val country = binding.etCountry.text.toString()
        val contactNumber = binding.etContactNumber.text.toString().trim()

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
                            Toast.makeText(
                                this@OrderFormActivity,
                                responseString,
                                Toast.LENGTH_SHORT
                            ).show()

                            var retrievedOrderId: String? = null
                            try {
                                val jsonResponse = JSONObject(responseString)
                                if (jsonResponse.has("orderId")) {
                                    retrievedOrderId = jsonResponse.getString("orderId")
                                    Log.d(TAG, "Extracted orderId from JSON: $retrievedOrderId")

                                } else {
                                    Log.w(
                                        TAG,
                                        "OrderId not found in JSON, checking for plain string"
                                    )
                                    retrievedOrderId = responseString
                                    Log.d(TAG, "Extracted orderId as plain string: $retrievedOrderId")
                                }

                            } catch (e: Exception) {
                                Log.e(
                                    TAG,
                                    "Error parsing response as JSON. Assuming plain string: ${e.message}",
                                    e
                                )
                                retrievedOrderId = responseString
                                Log.d(TAG, "Extracted orderId as plain string after error: $retrievedOrderId")
                            }
                            // Check for null before calling createPayment
                            if (retrievedOrderId != null) {
                                orderId = retrievedOrderId; // update the class variable.
                                // Call getPaymentLink instead of redirecting directly
                                getPaymentLink(retrievedOrderId)

                            } else {
                                Toast.makeText(
                                    this@OrderFormActivity,
                                    "Failed to retrieve order ID",
                                    Toast.LENGTH_SHORT
                                ).show()
                            }

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
                            Toast.makeText(this@OrderFormActivity, errorMessage, Toast.LENGTH_LONG)
                                .show()
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

    private fun getPaymentLink(orderId: String) {
        CoroutineScope(Dispatchers.IO).launch {  // Use a coroutine
            try {
                val paymentEntity = RetrofitClient.instance.getPaymentLink(orderId) // Get the PaymentEntity
                withContext(Dispatchers.Main) {
                    // Handle the successful response on the main thread
                    // Check if paymentEntity is not null
                    if (paymentEntity != null) {
                        paymentLink = paymentEntity.link // Use the 'link' field from PaymentEntity
                        Log.d(TAG, "Payment link: $paymentLink")
                        if (paymentLink != null) {
                            //  Now we have the payment link, redirect to PayMongo in the browser
                            redirectToPayMongoInBrowser(paymentLink!!) // Pass non-null paymentLink
                        } else {
                            Toast.makeText(
                                this@OrderFormActivity,
                                "Failed to retrieve payment link.",
                                Toast.LENGTH_SHORT
                            ).show()
                            binding.btnProceed.isEnabled = true;
                            binding.btnProceed.text = "Proceed to Payment"
                        }
                    } else {
                        Log.e(TAG, "PaymentEntity is null")
                        Toast.makeText(
                            this@OrderFormActivity,
                            "Failed to retrieve payment link.",
                            Toast.LENGTH_SHORT
                        ).show()
                        binding.btnProceed.isEnabled = true;
                        binding.btnProceed.text = "Proceed to Payment"
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    // Handle errors on the main thread
                    Log.e(TAG, "Error fetching payment link: ${e.message}")
                    Toast.makeText(
                        this@OrderFormActivity,
                        "Error fetching payment link: ${e.message}",
                        Toast.LENGTH_SHORT
                    ).show()
                    binding.btnProceed.isEnabled = true;
                    binding.btnProceed.text = "Proceed to Payment"
                }
            }
        }
    }

    private fun redirectToPayMongoInBrowser(paymentLink: String) {
        // Use an Intent to open the URL in the default browser.
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(paymentLink))
        try {
            startActivity(intent)
            showOrderConfirmation(orderId ?: "") // orderId can be null, handle it
        } catch (e: Exception) {
            Log.e(TAG, "Error opening browser: ${e.message}")
            Toast.makeText(this, "Failed to open browser: ${e.message}", Toast.LENGTH_LONG).show()
            binding.btnProceed.isEnabled = true;
            binding.btnProceed.text = "Proceed to Payment"
        }
    }

    private fun showOrderConfirmation(orderId: String) {
        // Start the Order Confirmation Activity
        val intent = Intent(this, OrderConfirmationActivity::class.java)
        intent.putExtra("orderId", orderId) // Pass the order ID
        startActivity(intent)
        finish() //  Close the current activity
    }

    override fun onDestroy() {
        super.onDestroy()
    }
}
