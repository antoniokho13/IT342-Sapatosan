package com.frontend_mobile

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.GravityCompat
import com.frontend_mobile.databinding.ActivityOrderFormBinding
import com.frontend_mobile.models.CartItem

class OrderFormActivity : AppCompatActivity() {

    private lateinit var binding: ActivityOrderFormBinding
    private var cartItems: ArrayList<CartItem> = arrayListOf()
    private var totalPrice: Double = 0.0

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityOrderFormBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Retrieve cart items and total price from intent
        cartItems = intent.getParcelableArrayListExtra("cartItems") ?: arrayListOf()
        totalPrice = intent.getDoubleExtra("totalPrice", 0.0)

        setupListeners()
        setupNavigationBar()
    }

    private fun setupListeners() {
        binding.btnProceed.setOnClickListener {
            val firstName = binding.etFirstName.text.toString().trim()
            val lastName = binding.etLastName.text.toString().trim()
            val email = binding.etEmail.text.toString().trim()
            val address = binding.etAddress.text.toString().trim()
            val postalCode = binding.etPostalCode.text.toString().trim()
            val country = binding.etCountry.text.toString().trim()
            val contactNumber = binding.etContactNumber.text.toString().trim()

            if (firstName.isEmpty() || lastName.isEmpty() || email.isEmpty() || address.isEmpty() ||
                postalCode.isEmpty() || country.isEmpty() || contactNumber.isEmpty()
            ) {
                Toast.makeText(this, "Please fill in all fields", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            // Proceed to OrderConfirmationActivity
            val intent = Intent(this, OrderConfirmationActivity::class.java).apply {
                putParcelableArrayListExtra("cartItems", cartItems)
                putExtra("totalPrice", totalPrice)
                putExtra("firstName", firstName)
                putExtra("lastName", lastName)
                putExtra("email", email)
                putExtra("address", address)
                putExtra("postalCode", postalCode)
                putExtra("country", country)
                putExtra("contactNumber", contactNumber)
            }
            startActivity(intent)
        }
    }

    private fun setupNavigationBar() {
        binding.icMenu.setOnClickListener {
            val drawerLayout = binding.drawerLayout
            if (drawerLayout.isDrawerOpen(GravityCompat.END)) {
                drawerLayout.closeDrawer(GravityCompat.END)
            } else {
                drawerLayout.openDrawer(GravityCompat.END)
            }
        }

        binding.drawerProfile.setOnClickListener {
            startActivity(Intent(this, ProfileActivity::class.java))
        }
        binding.drawerShoppingCart.setOnClickListener {
            startActivity(Intent(this, ShoppingCartActivity::class.java))
        }
        binding.tvSettings.setOnClickListener {
            startActivity(Intent(this, SettingsActivity::class.java))
        }
        binding.drawerLogout.setOnClickListener {
            // Clear user session
            val sharedPrefs = getSharedPreferences("user_session", Context.MODE_PRIVATE)
            sharedPrefs.edit().clear().apply()
            val intent = Intent(this, LoginActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            startActivity(intent)
            finish()
        }
    }
}