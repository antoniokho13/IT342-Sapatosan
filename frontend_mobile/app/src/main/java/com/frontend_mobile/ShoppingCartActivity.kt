package com.frontend_mobile

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.frontend_mobile.adapters.CartAdapter
import com.frontend_mobile.databinding.ActivityShoppingCartBinding
import com.frontend_mobile.models.CartManager
import com.bumptech.glide.Glide

class ShoppingCartActivity : AppCompatActivity() {

    private lateinit var binding: ActivityShoppingCartBinding
    private lateinit var cartAdapter: CartAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityShoppingCartBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupToolbar()
        setupRecyclerView()
        updateCartSummary()
    }


    private fun setupToolbar() {
        Glide.with(this).load(R.drawable.logo).into(binding.shoeLogo)
    }

    private fun setupRecyclerView() {
        cartAdapter = CartAdapter(CartManager.getCartItems().toMutableList()) {
            updateCartSummary()
        }

        binding.cartRecyclerView.apply {
            layoutManager = LinearLayoutManager(this@ShoppingCartActivity)
            adapter = cartAdapter
        }
    }

    private fun updateCartSummary() {
        val totalPrice = CartManager.getCartItems().sumOf { it.shoe.price * it.selectedQuantity }
        binding.totalPrice.text = "Total: ₱${"%.2f".format(totalPrice)}"
    }
}