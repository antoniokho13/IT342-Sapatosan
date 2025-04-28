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
import com.frontend_mobile.models.CartEntity
import com.frontend_mobile.models.CartItem
import com.frontend_mobile.models.OrderProductEntity
import com.frontend_mobile.models.ProductDTO
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class ShoppingCartActivity : AppCompatActivity() {

    private lateinit var binding: ActivityShoppingCartBinding
    private lateinit var cartAdapter: CartAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityShoppingCartBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupToolbar()
        setupRecyclerView()
        loadCartItems()
        setupCheckoutButton()
    }

    private fun setupToolbar() {
        binding.toolbar.setNavigationOnClickListener {
            onBackPressedDispatcher.onBackPressed()
        }
    }

    private fun setupRecyclerView() {
        cartAdapter = CartAdapter(mutableListOf()) {
            updateTotalPrice()
        }
        binding.cartRecyclerView.apply {
            adapter = cartAdapter
            layoutManager = LinearLayoutManager(this@ShoppingCartActivity)
        }
    }

    private fun loadCartItems() {
        val mockCartItems = listOf(
            CartItem(
                id = "1",
                product = "Mock Product",
                selectedSize = "Default",
                selectedQuantity = 1,
                name = "Mock Product",
                price = 100.0,
                size = "Default",
                quantity = 1,
                imageUrl = "https://via.placeholder.com/150",
                brand = "Mock Brand",
                stock = 10,
                productId = "1",
                isSelected = false
            )
        )
        cartAdapter.updateItems(mockCartItems)
        showCartContent()
        updateTotalPrice()
    }

    private fun setupCheckoutButton() {
        binding.btnCheckout.setOnClickListener {
            if (cartAdapter.itemCount > 0) {
                checkout()
            } else {
                showError("Your cart is empty")
            }
        }
    }

    private fun checkout() {
        val orderItems = cartAdapter.getCartItems().map { cartItem ->
            OrderProductEntity(
                productId = cartItem.productId,
                product = cartItem.product,
                quantity = cartItem.selectedQuantity,
                price = cartItem.price
            )
        }

        startActivity(Intent(this, OrderFormActivity::class.java).apply {
            putParcelableArrayListExtra("orderItems", ArrayList(orderItems))
            putExtra("totalPrice", cartAdapter.getTotalPrice())
        })
    }

    private fun showCartContent() {
        binding.cartRecyclerView.visibility = View.VISIBLE
        binding.cartSummaryLayout.visibility = View.VISIBLE
        binding.emptyCartText.visibility = View.GONE
    }

    private fun showEmptyCart() {
        binding.cartRecyclerView.visibility = View.GONE
        binding.cartSummaryLayout.visibility = View.GONE
        binding.emptyCartText.visibility = View.VISIBLE
    }

    private fun updateTotalPrice() {
        binding.totalPrice.text = "Total: ₱${"%.2f".format(cartAdapter.getTotalPrice())}"
    }

    private fun showError(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_LONG).show()
        Log.e("ShoppingCart", message)
    }
}
