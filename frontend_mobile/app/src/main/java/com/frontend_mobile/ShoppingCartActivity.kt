package com.frontend_mobile

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.frontend_mobile.adapters.CartAdapter
import com.frontend_mobile.api.RetrofitClient
import com.frontend_mobile.databinding.ActivityShoppingCartBinding
import com.frontend_mobile.models.CartEntity
import com.frontend_mobile.models.ProductEntity
import com.frontend_mobile.models.ShoeItem
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class ShoppingCartActivity : AppCompatActivity() {

    private lateinit var binding: ActivityShoppingCartBinding
    private lateinit var cartAdapter: CartAdapter
    private var cartItems: MutableList<ProductEntity> = mutableListOf()
    private var totalPrice: Double = 0.0

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityShoppingCartBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupRecyclerView()

        // 🔵 Check if a product was passed manually (with size)
        val productFromIntent = intent.getParcelableExtra<ProductEntity>("productEntity")
        if (productFromIntent != null) {
            cartItems.add(productFromIntent)
            cartAdapter.notifyDataSetChanged()
            calculateTotalPrice()
            showCartContent()
        } else {
            fetchCartItems()
        }

        binding.btnCheckout.setOnClickListener {
            if (cartItems.isEmpty()) {
                Toast.makeText(this, "Your cart is empty.", Toast.LENGTH_SHORT).show()
            } else {
                proceedToCheckout()
            }
        }
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
                if (response.isSuccessful) {
                    val cart = response.body()
                    if (cart != null && cart.cartProductIds.isNotEmpty()) {
                        loadProducts(cart.cartProductIds)
                    } else {
                        showEmptyCart()
                    }
                } else {
                    showEmptyCart()
                    Toast.makeText(this@ShoppingCartActivity, "Failed to load cart.", Toast.LENGTH_SHORT).show()
                }
                binding.progressBar.visibility = View.GONE
            }

            override fun onFailure(call: Call<CartEntity>, t: Throwable) {
                showEmptyCart()
                binding.progressBar.visibility = View.GONE
                Toast.makeText(this@ShoppingCartActivity, "Error: ${t.message}", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun loadProducts(cartProductIds: Map<String, Int>) {
        RetrofitClient.instance.getProducts().enqueue(object : Callback<List<ShoeItem>> {
            override fun onResponse(call: Call<List<ShoeItem>>, response: Response<List<ShoeItem>>) {
                if (response.isSuccessful) {
                    val products = response.body() ?: emptyList()
                    cartItems.clear()

                    for (shoeItem in products) {
                        if (cartProductIds.containsKey(shoeItem.id)) {
                            val quantity = cartProductIds[shoeItem.id] ?: 1

                            // Map ShoeItem ➔ ProductEntity manually
                            val product = ProductEntity(
                                id = shoeItem.id,
                                name = shoeItem.name,
                                brand = shoeItem.brand,
                                price = shoeItem.price,
                                stock = shoeItem.stock,
                                imageUrl = shoeItem.imageUrl,
                                categoryId = shoeItem.categoryId,
                                quantity = quantity,
                                size = null // ❗ Loaded from backend, size is not saved
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
                    showEmptyCart()
                    Toast.makeText(this@ShoppingCartActivity, "Failed to fetch products.", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<List<ShoeItem>>, t: Throwable) {
                showEmptyCart()
                Toast.makeText(this@ShoppingCartActivity, "Error fetching products: ${t.message}", Toast.LENGTH_SHORT).show()
            }
        })
    }

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

    private fun proceedToCheckout() {
        val intent = Intent(this, OrderFormActivity::class.java).apply {
            putParcelableArrayListExtra("cartItems", ArrayList(cartItems))
            putExtra("totalPrice", totalPrice)
        }

        startActivity(intent)
    }
}
