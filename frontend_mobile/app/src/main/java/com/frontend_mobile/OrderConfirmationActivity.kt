package com.frontend_mobile

import android.os.Bundle
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import com.frontend_mobile.api.RetrofitClient
import com.frontend_mobile.models.OrderRequest
import com.frontend_mobile.models.OrderProductEntity
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class OrderConfirmationActivity : AppCompatActivity() {

    private lateinit var paymentMethodSpinner: Spinner
    private lateinit var confirmOrderButton: Button
    private lateinit var shippingAddressEditText: EditText
    private var cartItems: ArrayList<OrderProductEntity> = arrayListOf()
    private var totalPrice: Double = 0.0

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_order_confirmation)

        // Retrieve cart items and total price from intent
        cartItems = intent.getParcelableArrayListExtra("cartItems") ?: arrayListOf()
        totalPrice = intent.getDoubleExtra("totalPrice", 0.0)

        paymentMethodSpinner = findViewById(R.id.spPaymentMethod)
        confirmOrderButton = findViewById(R.id.btnConfirmOrder)
        shippingAddressEditText = findViewById(R.id.etShippingAddress)

        setupPaymentMethodSpinner()
        setupConfirmOrderButton()
    }

    private fun setupPaymentMethodSpinner() {
        val paymentMethods = listOf("Credit Card", "PayPal", "Cash on Delivery")
        val adapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, paymentMethods)
        paymentMethodSpinner.adapter = adapter
    }

    private fun setupConfirmOrderButton() {
        confirmOrderButton.setOnClickListener {
            val shippingAddress = shippingAddressEditText.text.toString().trim()
            val paymentMethod = paymentMethodSpinner.selectedItem.toString()

            if (shippingAddress.isEmpty()) {
                Toast.makeText(this, "Please enter a shipping address", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val userId = RetrofitClient.getUserIdFromPrefs()
            val orderRequest = OrderRequest(
                userId = userId,
                items = cartItems,
                totalPrice = totalPrice,
                shippingAddress = shippingAddress,
                paymentMethod = paymentMethod
            )

            processPayment(orderRequest)
        }
    }

    private fun processPayment(orderRequest: OrderRequest) {
        RetrofitClient.instance.createOrder(orderRequest).enqueue(object : Callback<Void> {
            override fun onResponse(call: Call<Void>, response: Response<Void>) {
                if (response.isSuccessful) {
                    Toast.makeText(this@OrderConfirmationActivity, "Order placed successfully!", Toast.LENGTH_SHORT).show()
                    finish() // Close the activity
                } else {
                    Toast.makeText(this@OrderConfirmationActivity, "Failed to place order.", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<Void>, t: Throwable) {
                Toast.makeText(this@OrderConfirmationActivity, "Error: ${t.message}", Toast.LENGTH_SHORT).show()
            }
        })
    }
}