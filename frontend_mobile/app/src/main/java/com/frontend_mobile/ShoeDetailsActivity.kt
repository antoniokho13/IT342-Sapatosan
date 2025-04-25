package com.frontend_mobile

import android.os.Bundle
import android.widget.Button
import android.widget.Spinner
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.GravityCompat
import com.bumptech.glide.Glide
import com.frontend_mobile.databinding.ActivityShoeDetailsBinding
import com.frontend_mobile.models.ShoeItem

class ShoeDetailsActivity : AppCompatActivity() {

    private lateinit var binding: ActivityShoeDetailsBinding
    private var allShoes: List<ShoeItem> = emptyList()
    private var selectedShoe: ShoeItem? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityShoeDetailsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Retrieve data passed from HomeActivity
        allShoes = intent.getParcelableArrayListExtra("allShoes") ?: emptyList()
        selectedShoe = intent.getParcelableExtra("selectedShoe")

        // Set up the navbar
        binding.shoeNameToolbar.text = selectedShoe?.name ?: "Shoe Details"
        Glide.with(this).load(R.drawable.logo).into(binding.shoeLogo)

        // Hamburger menu functionality
        binding.icMenu.setOnClickListener {
            val drawerLayout = binding.drawerLayout
            if (drawerLayout.isDrawerOpen(GravityCompat.END)) {
                drawerLayout.closeDrawer(GravityCompat.END)
            } else {
                drawerLayout.openDrawer(GravityCompat.END)
            }
        }

        // Display shoe details
        selectedShoe?.let { displayShoeDetails(it) }
        setupSizeButtons()
        setupQuantitySpinner()

        // Add to cart button functionality
        binding.btnAddToCart.setOnClickListener {
            Toast.makeText(this, "${selectedShoe?.name} added to cart!", Toast.LENGTH_SHORT).show()
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
        val sizes = listOf("5","6", "7", "8", "9", "10","11", "12")
        sizes.forEach { size ->
            val button = Button(this).apply {
                text = size
                setBackgroundColor(resources.getColor(android.R.color.darker_gray))
                setOnClickListener {
                    Toast.makeText(this@ShoeDetailsActivity, "Size $size selected", Toast.LENGTH_SHORT).show()
                }
            }
            binding.sizeButtonsContainer.addView(button)
        }
    }

    private fun setupQuantitySpinner() {
        val quantities = (1..10).toList()
        val adapter = android.widget.ArrayAdapter(
            this,
            android.R.layout.simple_spinner_item,
            quantities
        )
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        binding.quantitySpinner.adapter = adapter
    }
}