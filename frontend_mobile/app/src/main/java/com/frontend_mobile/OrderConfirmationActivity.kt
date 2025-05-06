package com.frontend_mobile

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.frontend_mobile.adapters.OrderConfirmationAdapter
import com.frontend_mobile.databinding.ActivityOrderConfirmationBinding
import com.frontend_mobile.models.ProductEntity

class OrderConfirmationActivity : AppCompatActivity() {

    private lateinit var binding: ActivityOrderConfirmationBinding
    private var cartItems: ArrayList<ProductEntity> = arrayListOf()
    private var totalPrice: Double = 0.0
    private var orderId: String? = null
    private val TAG = "OrderConfirmActivity"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityOrderConfirmationBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Retrieve order details from intent
        orderId = intent.getStringExtra("orderId")
        cartItems = intent.getParcelableArrayListExtra("cartItems") ?: arrayListOf()
        totalPrice = intent.getDoubleExtra("totalPrice", 0.0)

        Log.d(TAG, "onCreate: orderId from intent = $orderId")

        setupUI()
        setupRecyclerView()
    }

    private fun setupUI() {
        // Check for null values before setting the text
        if (orderId != null) {
            binding.tvOrderId.text = getString(R.string.order_id_placeholder, orderId)
            Log.d(TAG, "setupUI: orderId is not null, setting text to $orderId")
        } else {
            binding.tvOrderId.text = getString(R.string.order_id_placeholder, "N/A")
            Log.d(TAG, "setupUI: orderId is null, setting text to N/A")
        }
        binding.tvTotalPrice.text = getString(R.string.total_price_placeholder, totalPrice)

        //  Change this part
        binding.btnBackToHome.setOnClickListener {  // Changed to btnBackToHome
            // Navigate back to HomeActivity and clear the back stack
            val intent = Intent(this, HomeActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            startActivity(intent)
            finish()
        }
    }

    private fun setupRecyclerView() {
        if (cartItems.isNotEmpty()) {
            binding.recyclerViewOrderItems.apply {
                layoutManager = LinearLayoutManager(this@OrderConfirmationActivity)
                adapter = OrderConfirmationAdapter(cartItems)
            }
        } else {
            Log.w(TAG, "setupRecyclerView: cartItems is empty")
            Toast.makeText(this, "No items in the order to display.", Toast.LENGTH_SHORT).show()
        }
    }
}
