package com.frontend_mobile

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.frontend_mobile.adapters.OrderConfirmationAdapter
import com.frontend_mobile.api.RetrofitClient
import com.frontend_mobile.databinding.ActivityOrderConfirmationBinding
import com.frontend_mobile.models.PaymentEntity
import com.frontend_mobile.models.ProductEntity
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class OrderConfirmationActivity : AppCompatActivity() {

    private lateinit var binding: ActivityOrderConfirmationBinding
    private var cartItems: ArrayList<ProductEntity> = arrayListOf()
    private var totalPrice: Double = 0.0
    private var orderId: String? = null
    private var paymentLink: String? = null
    private val TAG = "OrderConfirmActivity"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityOrderConfirmationBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Retrieve order details from intent
        orderId = intent.getStringExtra("orderId")
        paymentLink = intent.getStringExtra("paymentLink")
        cartItems = intent.getParcelableArrayListExtra("cartItems") ?: arrayListOf()
        totalPrice = intent.getDoubleExtra("totalPrice", 0.0)

        Log.d(TAG, "onCreate: orderId from intent = $orderId") // ADD THIS LINE

        setupUI()
        setupRecyclerView()
    }

    private fun setupUI() {
        // Check for null values before setting the text
        if (orderId != null) {
            binding.tvOrderId.text = getString(R.string.order_id_placeholder, orderId)
            Log.d(TAG, "setupUI: orderId is not null, setting text to $orderId") // ADD THIS LINE
        } else {
            binding.tvOrderId.text = getString(R.string.order_id_placeholder, "N/A")
            Log.d(TAG, "setupUI: orderId is null, setting text to N/A")  // ADD THIS LINE
        }
        binding.tvTotalPrice.text = getString(R.string.total_price_placeholder, totalPrice)

        binding.btnProceedToPayment.setOnClickListener {
            if (paymentLink != null) {
                try {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(paymentLink))
                    startActivity(intent)
                } catch (e: Exception) {
                    Log.e(TAG, "Error parsing payment link: ${e.message}")
                    Toast.makeText(this, "Invalid payment link", Toast.LENGTH_SHORT).show()
                }
            } else {
                Toast.makeText(this, "Payment link not available", Toast.LENGTH_SHORT).show()
            }
        }

        binding.btnBackToHome.setOnClickListener {
            // Navigate back to HomeActivity and clear the back stack
            val intent = Intent(this, HomeActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            startActivity(intent)
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

    private fun createPayment(orderId: String, amount: Double) {
        val token = getSharedPreferences("APP_PREFS", MODE_PRIVATE)
            .getString("jwt_token", "") ?: ""

        val payment = mapOf(
            "amount" to amount,
            "description" to "Order Payment for $orderId"
        )

        val call = RetrofitClient.instance.createPayment(orderId, payment, "Bearer $token")
        call.enqueue(object : Callback<Void> {
            override fun onResponse(call: Call<Void>, response: Response<Void>) {
                if (response.isSuccessful) {
                    // Directly fetch and open the payment link
                    fetchPaymentLinkAndRedirect(orderId)
                } else {
                    Toast.makeText(this@OrderConfirmationActivity, "Failed to create payment", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<Void>, t: Throwable) {
                Toast.makeText(this@OrderConfirmationActivity, "Error: ${t.message}", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun fetchPaymentLinkAndRedirect(orderId: String) {
        val token = getSharedPreferences("APP_PREFS", MODE_PRIVATE)
            .getString("jwt_token", "") ?: ""

        val call = RetrofitClient.instance.getPaymentByOrderId(orderId, "Bearer $token")
        call.enqueue(object : Callback<PaymentEntity> {
            override fun onResponse(call: Call<PaymentEntity>, response: Response<PaymentEntity>) {
                val payment = response.body()
                if (payment != null && !payment.link.isNullOrEmpty()) {
                    try{
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(payment.link))
                        startActivity(intent)
                    } catch(e: Exception){
                        Log.e(TAG, "Error parsing payment link: ${e.message}")
                        Toast.makeText(this@OrderConfirmationActivity, "Invalid payment link", Toast.LENGTH_SHORT).show()
                    }

                } else {
                    Toast.makeText(this@OrderConfirmationActivity, "Payment link not available", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<PaymentEntity>, t: Throwable) {
                Toast.makeText(this@OrderConfirmationActivity, "Error: ${t.message}", Toast.LENGTH_SHORT).show()
            }
        })
    }
}

