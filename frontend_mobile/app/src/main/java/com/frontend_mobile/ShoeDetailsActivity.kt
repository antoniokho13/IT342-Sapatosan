package com.frontend_mobile

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.GravityCompat
import androidx.gridlayout.widget.GridLayout
import com.bumptech.glide.Glide
import com.frontend_mobile.api.ApiResponse
import com.frontend_mobile.api.ApiService
import com.frontend_mobile.api.RetrofitClient
import com.frontend_mobile.databinding.ActivityShoeDetailsBinding
import com.frontend_mobile.models.ShoeItem
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response


class ShoeDetailsActivity : AppCompatActivity() {

    private lateinit var binding: ActivityShoeDetailsBinding
    private lateinit var apiService: ApiService
    private lateinit var token: String // This should be retrieved from SharedPreferences or wherever you store it
    private lateinit var userId: String // This should also come from SharedPreferences or your app logic
    private var allShoes: List<ShoeItem> = emptyList()
    private var selectedShoe: ShoeItem? = null
    private var selectedSize: String? = null
    private var selectedQuantity: Int = 1
    private var selectedSizeButton: Button? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityShoeDetailsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        allShoes = intent.getParcelableArrayListExtra("allShoes") ?: emptyList()
        selectedShoe = intent.getParcelableExtra("selectedShoe")

        // Setup toolbar menu button
        binding.icMenu.setOnClickListener {
            val drawerLayout = binding.drawerLayout
            if (drawerLayout.isDrawerOpen(GravityCompat.END)) {
                drawerLayout.closeDrawer(GravityCompat.END)
            } else {
                drawerLayout.openDrawer(GravityCompat.END)
            }
        }

        // Drawer navigation
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
            RetrofitClient.clearToken()
            val intent = Intent(this, LoginActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            startActivity(intent)
            finish()
        }

        selectedShoe?.let { displayShoeDetails(it) }
        setupSizeButtons()
        setupQuantitySpinner()

        binding.btnAddToCart.setOnClickListener {
            addToCart()
        }
    }

    private fun displayShoeDetails(shoe: ShoeItem) {
        binding.shoeName.text = shoe.name
        binding.shoeBrand.text = "Brand: ${shoe.brand}"
        binding.shoePrice.text = "Price: ₱${shoe.price}"
        binding.shoeStock.text = "Stock: ${shoe.stock}"
        Glide.with(this).load(shoe.imageUrl).into(binding.shoeImage)
    }

    private fun setupSizeButtons() {
        val sizes = listOf("5", "6", "7", "8", "9", "10", "11", "12")
        val gridLayout = findViewById<GridLayout>(R.id.sizeButtonsContainer)
        gridLayout.removeAllViews()

        sizes.forEach { size ->
            val button = Button(this).apply {
                text = "US $size"
                setPadding(0, 16, 0, 16)
                textSize = 14f
                setAllCaps(false)
                setTextColor(resources.getColor(android.R.color.black))
                background = resources.getDrawable(R.drawable.size_button_background2, null)

                setOnClickListener {
                    selectedSizeButton?.background =
                        resources.getDrawable(R.drawable.size_button_background2, null)
                    selectedSizeButton?.setTextColor(resources.getColor(android.R.color.black))

                    background =
                        resources.getDrawable(R.drawable.size_button_selected_background, null)
                    setTextColor(resources.getColor(android.R.color.white))

                    selectedSizeButton = this
                    selectedSize = size // Save selected size!
                }
            }

            val params = GridLayout.LayoutParams().apply {
                width = 0
                height = GridLayout.LayoutParams.WRAP_CONTENT
                columnSpec = GridLayout.spec(GridLayout.UNDEFINED, 1f)
                setMargins(8, 8, 8, 8)
            }

            button.layoutParams = params
            gridLayout.addView(button)
        }
    }

    private fun setupQuantitySpinner() {
        val quantities = (1..10).toList()

        val adapter = object : ArrayAdapter<Int>(this, com.bumptech.glide.R.layout.support_simple_spinner_dropdown_item, quantities) {
            override fun getDropDownView(
                position: Int,
                convertView: View?,
                parent: ViewGroup
            ): View {
                val view = super.getDropDownView(position, convertView, parent)
                view.setBackgroundColor(resources.getColor(android.R.color.white))
                (view as TextView).setTextColor(resources.getColor(android.R.color.black))
                view.textAlignment = View.TEXT_ALIGNMENT_CENTER
                return view
            }
        }

        binding.quantitySpinner.adapter = adapter

        binding.quantitySpinner.onItemSelectedListener =
            object : AdapterView.OnItemSelectedListener {
                override fun onItemSelected(
                    parent: AdapterView<*>?,
                    view: View?,
                    position: Int,
                    id: Long
                ) {
                    selectedQuantity = quantities[position] // Save selected quantity!
                }

                override fun onNothingSelected(parent: AdapterView<*>?) {}
            }
    }

    private fun addToCart() {
        val userId = RetrofitClient.getUserIdFromPrefs()
        val shoe = selectedShoe ?: run {
            Toast.makeText(this, "No shoe selected", Toast.LENGTH_SHORT).show()
            return
        }
        val size = selectedSize ?: run {
            Toast.makeText(this, "Please select a size", Toast.LENGTH_SHORT).show()
            return
        }

        RetrofitClient.instance.addProductToCart(
            userId = userId,
            productId = shoe.id,
            quantity = selectedQuantity
        ).enqueue(object : Callback<ApiResponse> {
            override fun onResponse(call: Call<ApiResponse>, response: Response<ApiResponse>) {
                if (response.isSuccessful) {
                    Toast.makeText(this@ShoeDetailsActivity, "Product added to cart!", Toast.LENGTH_SHORT).show()
                    startActivity(Intent(this@ShoeDetailsActivity, ShoppingCartActivity::class.java))
                } else {
                    Toast.makeText(this@ShoeDetailsActivity, "Failed to add product to cart.", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<ApiResponse>, t: Throwable) {
                Toast.makeText(this@ShoeDetailsActivity, "Error: ${t.message}", Toast.LENGTH_SHORT).show()
            }
        })
    }
}

