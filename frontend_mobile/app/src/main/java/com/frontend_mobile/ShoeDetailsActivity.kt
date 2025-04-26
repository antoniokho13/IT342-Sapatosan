package com.frontend_mobile

import android.os.Bundle
import android.widget.Button
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.GravityCompat
import com.bumptech.glide.Glide
import com.frontend_mobile.databinding.ActivityShoeDetailsBinding
import com.frontend_mobile.models.ShoeItem
import android.widget.ArrayAdapter
import android.widget.TextView
import android.widget.Spinner
import android.view.View
import android.widget.AdapterView
import androidx.gridlayout.widget.GridLayout


class ShoeDetailsActivity : AppCompatActivity() {

    private lateinit var binding: ActivityShoeDetailsBinding
    private var allShoes: List<ShoeItem> = emptyList()
    private var selectedShoe: ShoeItem? = null
    private var selectedSizeButton: Button? = null

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
                    // Reset previous selection
                    selectedSizeButton?.background = resources.getDrawable(R.drawable.size_button_background2, null)
                    selectedSizeButton?.setTextColor(resources.getColor(android.R.color.black))

                    // Highlight this button
                    background = resources.getDrawable(R.drawable.size_button_selected_background, null)
                    setTextColor(resources.getColor(android.R.color.white))

                    selectedSizeButton = this

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
        // Create a list of quantities from 1 to 10
        val quantities = (1..10).toList()

        // Create the adapter for the spinner, using the custom spinner item layout
        val adapter = object : ArrayAdapter<Int>(this, R.layout.custom_spinner_item, quantities) {
            override fun getDropDownView(position: Int, convertView: android.view.View?, parent: android.view.ViewGroup): android.view.View {
                val view = super.getDropDownView(position, convertView, parent)
                // Customize the dropdown item view
                view.setBackgroundColor(resources.getColor(android.R.color.white))
                (view as TextView).setTextColor(resources.getColor(android.R.color.black))
                view.textAlignment = android.view.View.TEXT_ALIGNMENT_CENTER
                return view
            }
        }

        // Set the adapter to the spinner
        binding.quantitySpinner.adapter = adapter

        // Set the OnItemSelectedListener to detect item selection
        binding.quantitySpinner.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parentView: AdapterView<*>?, view: android.view.View?, position: Int, id: Long) {
                // Get the selected quantity
                val selectedQuantity = quantities[position]
                // For demonstration, show the selected quantity in a Toast
                Toast.makeText(applicationContext, "Selected Quantity: $selectedQuantity", Toast.LENGTH_SHORT).show()
            }

            override fun onNothingSelected(parentView: AdapterView<*>?) {
                // Optionally handle when nothing is selected (do nothing for now)
            }
        }
    }

}
