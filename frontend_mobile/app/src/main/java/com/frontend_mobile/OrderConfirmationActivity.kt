package com.frontend_mobile

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.frontend_mobile.adapters.OrderConfirmationAdapter
import com.frontend_mobile.api.RetrofitClient
import com.frontend_mobile.databinding.ActivityOrderConfirmationBinding
import com.frontend_mobile.models.CartItem
import com.frontend_mobile.models.OrderProductEntity
import com.frontend_mobile.models.OrderRequest
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class OrderConfirmationActivity : AppCompatActivity() {
    private lateinit var binding: ActivityOrderConfirmationBinding
    private lateinit var adapter: OrderConfirmationAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityOrderConfirmationBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val cartItems = intent.getParcelableArrayListExtra<CartItem>("cartItems") ?: ArrayList()
        val totalPrice = intent.getDoubleExtra("totalPrice", 0.0)

        setupUI(cartItems, totalPrice)
        setupListeners()
    }

    private fun setupUI(items: List<CartItem>, total: Double) {
        adapter = OrderConfirmationAdapter(items)
        binding.recyclerViewOrderItems.apply {
            layoutManager = LinearLayoutManager(this@OrderConfirmationActivity)
            adapter = this@OrderConfirmationActivity.adapter
        }

        binding.totalPrice.text = "Total: ₱${"%.2f".format(total)}"
    }

    private fun setupListeners() {
        binding.btnConfirmOrder.setOnClickListener {
            val shippingAddress = binding.etShippingAddress.text.toString().trim()
            val paymentMethod = binding.spPaymentMethod.selectedItem.toString()

            if (shippingAddress.isEmpty()) {
                Toast.makeText(this, "Please enter shipping address", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            submitOrder(shippingAddress, paymentMethod)
        }
    }

    private fun submitOrder(address: String, paymentMethod: String) {
        val orderRequest = OrderRequest(
            userId = RetrofitClient.getUserIdFromPrefs(),
            items = adapter.items.map { cartItem ->
                OrderProductEntity(
                    productId = cartItem.productId,
                    product = cartItem.name,
                    quantity = cartItem.selectedQuantity,
                    price = cartItem.price
                )
            },
            totalPrice = adapter.items.sumOf { it.price * it.selectedQuantity },
            shippingAddress = address,
            paymentMethod = paymentMethod
        )

        RetrofitClient.instance.createOrder(orderRequest).enqueue(object : Callback<Void> {
            override fun onResponse(call: Call<Void>, response: Response<Void>) {
                if (response.isSuccessful) {
                    Toast.makeText(this@OrderConfirmationActivity, "Order placed successfully!", Toast.LENGTH_SHORT).show()
                    finishAffinity() // Close all activities
                    startActivity(Intent(this@OrderConfirmationActivity, HomeActivity::class.java))
                } else {
                    Toast.makeText(this@OrderConfirmationActivity, "Failed to place order", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<Void>, t: Throwable) {
                Toast.makeText(this@OrderConfirmationActivity, "Error: ${t.message}", Toast.LENGTH_SHORT).show()
            }
        })
    }
}