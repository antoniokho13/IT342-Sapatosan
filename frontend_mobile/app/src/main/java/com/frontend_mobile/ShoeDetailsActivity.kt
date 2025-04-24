package com.frontend_mobile

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.ImageView
import android.widget.Spinner
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.SearchView
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

        // Display shoe details
        selectedShoe?.let { displayShoeDetails(it) }

        // Setup size buttons
        setupSizeButtons()

        // Setup quantity spinner (if needed)
        setupQuantitySpinner()

        // Setup Add to Cart button
        binding.btnAddToCart.setOnClickListener {
            Toast.makeText(this, "Added to cart!", Toast.LENGTH_SHORT).show()
        }

        // Access the SearchView from the included layout
        val searchView = findViewById<SearchView>(R.id.searchView)
        setupSearchBar(searchView)
    }

    private fun setupSearchBar(searchView: SearchView) {
        searchView.setOnQueryTextListener(object : SearchView.OnQueryTextListener {
            override fun onQueryTextSubmit(query: String?): Boolean {
                filterShoes(query)
                return true
            }

            override fun onQueryTextChange(newText: String?): Boolean {
                filterShoes(newText)
                return true
            }
        })
    }

    private fun filterShoes(query: String?) {
        val filteredShoes = if (query.isNullOrEmpty()) {
            allShoes
        } else {
            allShoes.filter { it.name.contains(query, ignoreCase = true) }
        }
        Toast.makeText(this, "Filtered ${filteredShoes.size} shoes", Toast.LENGTH_SHORT).show()
    }

    private fun setupSizeButtons() {
        val sizes = listOf("6", "7", "8", "9", "10", "11", "12") // Example sizes
        val sizeButtonsContainer = binding.sizeButtonsContainer
        var selectedButton: Button? = null

        sizes.forEach { size ->
            val button = Button(this).apply {
                text = size
                setBackgroundColor(resources.getColor(android.R.color.darker_gray))
                setTextColor(resources.getColor(android.R.color.white))
                setOnClickListener {
                    selectedButton?.setBackgroundColor(resources.getColor(android.R.color.darker_gray))
                    setBackgroundColor(resources.getColor(android.R.color.holo_blue_light))
                    selectedButton = this
                }
            }
            sizeButtonsContainer.addView(button)
        }
    }

    private fun setupQuantitySpinner() {
        val quantitySpinner: Spinner = binding.quantitySpinner
        // You can populate the spinner with values (e.g., 1 to 10) if needed
    }

    private fun displayShoeDetails(shoe: ShoeItem) {
        binding.shoeName.text = shoe.name
        binding.shoeBrand.text = shoe.brand
        binding.shoePrice.text = "₱${shoe.price}"
        binding.shoeStock.text = "Stock: ${shoe.stock}"
        Glide.with(this).load(shoe.imageUrl).into(binding.shoeImage)
    }
}