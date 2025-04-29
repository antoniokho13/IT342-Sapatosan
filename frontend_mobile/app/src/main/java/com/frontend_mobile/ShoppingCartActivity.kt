package com.frontend_mobile

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.frontend_mobile.adapters.CartAdapter
import com.frontend_mobile.api.RetrofitClient
import com.frontend_mobile.databinding.ActivityShoppingCartBinding
import com.frontend_mobile.models.OrderEntity
import com.frontend_mobile.models.PaymentEntity
import com.frontend_mobile.models.ProductEntity
import com.frontend_mobile.models.ShoeItem
import com.frontend_mobile.models.CartEntity
import org.json.JSONObject
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class ShoppingCartActivity : AppCompatActivity() {

    private lateinit var binding: ActivityShoppingCartBinding
    private lateinit var cartAdapter: CartAdapter
    private var cartItems: MutableList<ProductEntity> = mutableListOf()
    private var totalPrice: Double = 0.0
    private val TAG = "ShoppingCartActivity"

    // ========================================================================
    // 1. Initialization
    // ========================================================================
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityShoppingCartBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupRecyclerView()
        handleProductFromIntent() // Check for product passed directly
        setCheckoutButtonListener()
    }

    private fun setupRecyclerView() {
        cartAdapter = CartAdapter(
            cartItems,
            onQuantityChange = { calculateTotalPrice() },
            onCartUpdated = { calculateTotalPrice() }
        )
        binding.cartRecyclerView.layoutManager = LinearLayoutManager(this)
        binding.cartRecyclerView.adapter = cartAdapter
    }

    private fun handleProductFromIntent() {
        val productFromIntent = intent.getParcelableExtra<ProductEntity>("productEntity")
        if (productFromIntent != null) {
            cartItems.add(productFromIntent)
            cartAdapter.notifyDataSetChanged()
            calculateTotalPrice()
            showCartContent()
        } else {
            fetchCartItems()
        }
    }

    private fun setCheckoutButtonListener() {
        binding.btnCheckout.setOnClickListener {
            if (cartItems.isEmpty()) {
                Toast.makeText(this, "Your cart is empty.", Toast.LENGTH_SHORT).show()
            } else {
                proceedToCheckout()
            }
        }
    }

    // ========================================================================
    // 2. Fetching Cart Data
    // ========================================================================
    private fun fetchCartItems() {
        val userId = getSharedPreferences("user_session", MODE_PRIVATE)
            .getString("user_id", null)

        if (userId.isNullOrEmpty()) {
            Toast.makeText(this, "User not logged in.", Toast.LENGTH_SHORT).show()
            return
        }

        binding.progressBar.visibility = View.VISIBLE
        RetrofitClient.instance.getCartByUserId(userId).enqueue(object : Callback<CartEntity> {
            override fun onResponse(call: Call<CartEntity>, response: Response<CartEntity>) {
                binding.progressBar.visibility = View.GONE
                if (response.isSuccessful) {
                    val cart = response.body()
                    if (cart != null && cart.cartProductIds.isNotEmpty()) {
                        loadProducts(cart.cartProductIds)
                    } else {
                        showEmptyCart() // Cart is empty
                    }
                } else {
                    showEmptyCart() // Error loading cart
                    Log.e(TAG, "Failed to load cart: ${response.errorBody()?.string()}")
                    Toast.makeText(this@ShoppingCartActivity, "Failed to load cart.", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<CartEntity>, t: Throwable) {
                binding.progressBar.visibility = View.GONE
                showEmptyCart() // Error
                Log.e(TAG, "Error fetching cart: ${t.message}", t)
                Toast.makeText(this@ShoppingCartActivity, "Error: ${t.message}", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun loadProducts(cartProductIds: Map<String, Int>) {
        RetrofitClient.instance.getProducts().enqueue(object : Callback<List<ShoeItem>> {
            override fun onResponse(call: Call<List<ShoeItem>>, response: Response<List<ShoeItem>>) {
                if (response.isSuccessful) {
                    val products = response.body() ?: emptyList()
                    cartItems.clear() // Clear previous cart items

                    for (shoeItem in products) {
                        if (cartProductIds.containsKey(shoeItem.id)) {
                            val quantity = cartProductIds[shoeItem.id] ?: 1
                            val product = ProductEntity(  // Map ShoeItem to ProductEntity
                                id = shoeItem.id,
                                name = shoeItem.name,
                                brand = shoeItem.brand,
                                price = shoeItem.price,
                                stock = shoeItem.stock,
                                imageUrl = shoeItem.imageUrl,
                                categoryId = shoeItem.categoryId,
                                quantity = quantity,
                                size = null
                            )
                            cartItems.add(product)
                        }
                    }
                    cartAdapter.notifyDataSetChanged()
                    calculateTotalPrice()
                    if (cartItems.isEmpty()) {
                        showEmptyCart()
                    } else {
                        showCartContent()
                    }
                } else {
                    showEmptyCart() // error
                    Log.e(TAG, "Failed to fetch products: ${response.errorBody()?.string()}")
                    Toast.makeText(this@ShoppingCartActivity, "Failed to fetch products.", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<List<ShoeItem>>, t: Throwable) {
                showEmptyCart() // error
                Log.e(TAG, "Error fetching products: ${t.message}", t)
                Toast.makeText(this@ShoppingCartActivity, "Error fetching products: ${t.message}", Toast.LENGTH_SHORT).show()
            }
        })
    }

    // ========================================================================
    // 3. Handling UI Updates
    // ========================================================================
    private fun calculateTotalPrice() {
        totalPrice = cartItems.sumOf { it.price * it.quantity }
        binding.totalPrice.text = "Total: ₱${"%.2f".format(totalPrice)}"
    }

    private fun showEmptyCart() {
        binding.cartRecyclerView.visibility = View.GONE
        binding.cartSummaryLayout.visibility = View.GONE
        binding.emptyCartText.visibility = View.VISIBLE
    }

    private fun showCartContent() {
        binding.cartRecyclerView.visibility = View.VISIBLE
        binding.cartSummaryLayout.visibility = View.VISIBLE
        binding.emptyCartText.visibility = View.GONE
    }

    private fun showLoading(isLoading: Boolean) {
        binding.progressBar.visibility = if (isLoading) View.VISIBLE else View.GONE
        binding.btnCheckout.isEnabled = !isLoading
    }

    // ========================================================================
    // 4. Checkout Process
    // ========================================================================
    private fun proceedToCheckout() {
        val userId = getSharedPreferences("user_session", MODE_PRIVATE).getString("user_id", null)
        if (userId == null) {
            Toast.makeText(this, "User not logged in", Toast.LENGTH_SHORT).show()
            return
        }

        val firstName = getSharedPreferences("user_details", MODE_PRIVATE).getString("firstName", "") ?: ""
        val lastName = getSharedPreferences("user_details", MODE_PRIVATE).getString("lastName", "") ?: ""
        val email = getSharedPreferences("user_details", MODE_PRIVATE).getString("email", "") ?: ""
        val address = getSharedPreferences("user_details", MODE_PRIVATE).getString("address", "") ?: ""
        val postalCode = getSharedPreferences("user_details", MODE_PRIVATE).getString("postalCode", "") ?: ""
        val country = getSharedPreferences("user_details", MODE_PRIVATE).getString("country", "") ?: ""
        val contactNumber = getSharedPreferences("user_details", MODE_PRIVATE).getString("contactNumber", "") ?: ""

        if (firstName.isEmpty() || lastName.isEmpty() || email.isEmpty() || address.isEmpty() || postalCode.isEmpty() || country.isEmpty() || contactNumber.isEmpty()) {
            val intent = Intent(this, OrderFormActivity::class.java).apply {
                putExtra("cartItems", ArrayList(cartItems)) // Pass cartItems to OrderFormActivity
                putExtra("totalPrice", totalPrice)
            }
            startActivity(intent)
        } else {
            createOrder(userId, firstName, lastName, email, address, postalCode, country, contactNumber)
        }
    }

    private fun createOrder(
        userId: String,
        firstName: String,
        lastName: String,
        email: String,
        address: String,
        postalCode: String,
        country: String,
        contactNumber: String
    ) {
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

        showLoading(true)
        RetrofitClient.instance.createOrderFromCart(userId, orderDetails).enqueue(object : Callback<String> {
            override fun onResponse(call: Call<String>, response: Response<String>) {
                showLoading(false)
                if (response.isSuccessful) {
                    val orderIdString = response.body() ?: ""
                    val orderId = extractOrderId(orderIdString)  // Extract order ID
                    Log.d(TAG, "ShoppingCartActivity: orderId from server = $orderId")
                    if (orderId != null) {
                        fetchPaymentDetails(orderId)
                    } else {
                        //navigate
                        val intent = Intent(this@ShoppingCartActivity, OrderConfirmationActivity::class.java).apply {
                            putExtra("orderId", orderId as String?)
                            putExtra("totalPrice", totalPrice)
                            putParcelableArrayListExtra("cartItems", ArrayList(cartItems))
                        }
                        startActivity(intent)
                    }
                } else {
                    Log.e(TAG, "Failed to create order: ${response.errorBody()?.string()}")
                    Toast.makeText(this@ShoppingCartActivity, "Failed to create order.", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<String>, t: Throwable) {
                showLoading(false)
                Log.e(TAG, "Error creating order: ${t.message}", t)
                Toast.makeText(this@ShoppingCartActivity, "Error creating order: ${t.message}", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun extractOrderId(response: String): String? {
        val prefix = "OrderID:"
        val startIndex = response.indexOf(prefix)
        if (startIndex != -1) {
            val idStartIndex = startIndex + prefix.length
            val endIndex = response.indexOf(",", idStartIndex) //  <--  Find the end of the ID
            if (endIndex != -1) {
                return response.substring(idStartIndex, endIndex).trim()
            }
            else{
                return response.substring(idStartIndex).trim()
            }
        }
        return null
    }

    private fun fetchPaymentDetails(orderId: String) {
        val token = getSharedPreferences("user_session", MODE_PRIVATE).getString("token", "") ?: ""

        showLoading(true)
        RetrofitClient.instance.getPaymentByOrderId(orderId, "Bearer $token").enqueue(object : Callback<PaymentEntity> {
            override fun onResponse(call: Call<PaymentEntity>, response: Response<PaymentEntity>) {
                showLoading(false)
                if (response.isSuccessful) {
                    val payment = response.body()
                    if (payment != null) {
                        val intent = Intent(this@ShoppingCartActivity, OrderConfirmationActivity::class.java).apply {
                            putExtra("orderId", orderId)
                            putExtra("paymentLink", payment.link)
                            putExtra("totalPrice", totalPrice)
                            putParcelableArrayListExtra("cartItems", ArrayList(cartItems))
                        }
                        startActivity(intent)
                    } else {
                        Log.e(TAG, "Failed to fetch payment details: Response body is null")
                        Toast.makeText(this@ShoppingCartActivity, "Failed to fetch payment details.", Toast.LENGTH_SHORT).show()
                    }
                } else {
                    Log.e(TAG, "Failed to fetch payment details: ${response.errorBody()?.string()}")
                    Toast.makeText(this@ShoppingCartActivity, "Failed to fetch payment details.", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<PaymentEntity>, t: Throwable) {
                showLoading(false)
                Log.e(TAG, "Error fetching payment details: ${t.message}", t)
                Toast.makeText(this@ShoppingCartActivity, "Error fetching payment details: ${t.message}", Toast.LENGTH_SHORT).show()
            }
        })
    }
}