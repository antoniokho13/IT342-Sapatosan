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
import com.frontend_mobile.api.RetrofitClient
import com.frontend_mobile.databinding.ActivityShoeDetailsBinding
import com.frontend_mobile.models.CartItem
import com.frontend_mobile.models.CartManager
import com.frontend_mobile.models.ShoeItem

class ShoeDetailsActivity : AppCompatActivity() {

    private lateinit var binding: ActivityShoeDetailsBinding
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

        binding.shoeNameToolbar.text = selectedShoe?.name ?: "Shoe Details"
        Glide.with(this).load(R.drawable.logo).into(binding.shoeLogo)

        binding.icMenu.setOnClickListener {
            val drawerLayout = binding.drawerLayout
            if (drawerLayout.isDrawerOpen(GravityCompat.END)) {
                drawerLayout.closeDrawer(GravityCompat.END)
            } else {
                drawerLayout.openDrawer(GravityCompat.END)
            }
        }

        selectedShoe?.let { displayShoeDetails(it) }
        setupSizeButtons()
        setupQuantitySpinner()

        binding.btnAddToCart.setOnClickListener {
            addToCart()
        }
    }

    private fun setupToolbar() {
        binding.icMenu.setOnClickListener {
            if (binding.drawerLayout.isDrawerOpen(GravityCompat.END)) {
                binding.drawerLayout.closeDrawer(GravityCompat.END)
            } else {
                binding.drawerLayout.openDrawer(GravityCompat.END)
            }
        }

        // Set up drawer navigation items
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

            // Clear token from RetrofitClient
            RetrofitClient.clearToken()

            // Navigate to LoginActivity
            val intent = Intent(this, LoginActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            startActivity(intent)
            finish()
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

                    Toast.makeText(
                        this@ShoeDetailsActivity,
                        "Selected Size US $size",
                        Toast.LENGTH_SHORT
                    ).show()
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

        val adapter = object : ArrayAdapter<Int>(this, R.layout.custom_spinner_item, quantities) {
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
        if (selectedSize == null) {
            Toast.makeText(this, "Please select a size.", Toast.LENGTH_SHORT).show()
            return
        }

        val shoe = selectedShoe ?: return

        val cartItem = CartItem(
            shoe = shoe,
            selectedSize = selectedSize!!,
            selectedQuantity = selectedQuantity
        )

        CartManager.addItem(cartItem)
        Toast.makeText(
            this,
            "${shoe.name} (Size US $selectedSize x$selectedQuantity) added to cart!",
            Toast.LENGTH_SHORT
        ).show()
        val intent = Intent(this, ShoppingCartActivity::class.java)
        startActivity(intent)
    }
}
