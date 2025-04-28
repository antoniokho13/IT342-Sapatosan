package com.frontend_mobile

import android.content.Intent
import android.content.res.ColorStateList
import android.os.Bundle
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.bumptech.glide.Glide
import com.frontend_mobile.api.RetrofitClient
import com.frontend_mobile.models.AddProductToCartRequest
import com.frontend_mobile.models.ProductEntity
import com.frontend_mobile.models.ShoeItem
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import kotlin.compareTo

class ShoeDetailsActivity : AppCompatActivity() {

    private lateinit var shoeImage: ImageView
    private lateinit var shoeName: TextView
    private lateinit var shoeBrand: TextView
    private lateinit var shoePrice: TextView
    private lateinit var shoeStock: TextView
    private lateinit var quantitySpinner: Spinner
    private lateinit var addToCartButton: Button
    private lateinit var sizeButtonsContainer: androidx.gridlayout.widget.GridLayout
    private var selectedShoe: ShoeItem? = null
    private var selectedSize: Int? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_shoe_details)

        shoeImage = findViewById(R.id.shoeImage)
        shoeName = findViewById(R.id.shoeName)
        shoeBrand = findViewById(R.id.shoeBrand)
        shoePrice = findViewById(R.id.shoePrice)
        shoeStock = findViewById(R.id.shoeStock)
        quantitySpinner = findViewById(R.id.quantitySpinner)
        addToCartButton = findViewById(R.id.btnAddToCart)
        sizeButtonsContainer = findViewById(R.id.sizeButtonsContainer)

        setupSizeButtons()

        selectedShoe = intent.getParcelableExtra("selectedShoe")
        selectedShoe?.let { shoe ->
            displayShoeDetails(shoe)
        }

        addToCartButton.setOnClickListener {
            addToCart()
        }
    }

    private fun setupSizeButtons() {
        for (size in 5..12) {
            val button = Button(this).apply {
                text = size.toString()
                layoutParams = androidx.gridlayout.widget.GridLayout.LayoutParams().apply {
                    width = resources.getDimensionPixelSize(R.dimen.size_button_width)
                    height = resources.getDimensionPixelSize(R.dimen.size_button_height)
                    setMargins(8, 8, 8, 8)
                }
                background = ContextCompat.getDrawable(context, R.drawable.size_button_selector)
                setTextColor(ColorStateList.valueOf(getColor(android.R.color.black)))
                textSize = 14f
                isAllCaps = false
                setOnClickListener {
                    updateSizeSelection(this, size)
                }
            }
            sizeButtonsContainer.addView(button)
        }
    }

    private fun updateSizeSelection(clickedButton: Button, size: Int) {
        // Reset all buttons
        for (i in 0 until sizeButtonsContainer.childCount) {
            val button = sizeButtonsContainer.getChildAt(i) as Button
            button.isSelected = false
            button.setTextColor(getColor(android.R.color.black))
        }
        // Highlight selected button
        clickedButton.isSelected = true
        clickedButton.setTextColor(getColor(android.R.color.white))
        selectedSize = size
    }

    private fun displayShoeDetails(shoe: ShoeItem) {
        Glide.with(this).load(shoe.imageUrl).into(shoeImage)
        shoeName.text = shoe.name
        shoeBrand.text = "Brand: ${shoe.brand}"
        shoePrice.text = "Price: ₱${shoe.price}"
        shoeStock.text = "Stock: ${shoe.stock}"

        // Fix for quantity spinner
        val quantities = if (shoe.stock > 10) (1..shoe.stock).toList() else listOf(1)
        val adapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, quantities)
        quantitySpinner.adapter = adapter
    }

    private fun addToCart() {
        if (selectedSize == null) {
            Toast.makeText(this, "Please select a size", Toast.LENGTH_SHORT).show()
            return
        }

        val quantity = quantitySpinner.selectedItem as Int
        val shoe = selectedShoe ?: return

        val userId = RetrofitClient.getUserIdFromPrefs()
        val request = AddProductToCartRequest(productId = shoe.id, quantity = quantity)

        // Store the selected size temporarily
        val productWithSize = shoe.copy().also {
            (it as? ShoeItem)?.let { shoeItem ->
                ProductEntity(
                    id = shoeItem.id,
                    name = shoeItem.name,
                    brand = shoeItem.brand,
                    price = shoeItem.price,
                    stock = shoeItem.stock,
                    imageUrl = shoeItem.imageUrl,
                    categoryId = shoeItem.categoryId,
                    quantity = quantity,
                    size = selectedSize.toString()
                )
            }
        }

        RetrofitClient.instance.addProductToCart(userId, request).enqueue(object : Callback<Void> {
            override fun onResponse(call: Call<Void>, response: Response<Void>) {
                if (response.isSuccessful) {
                    Toast.makeText(this@ShoeDetailsActivity, "Added to cart!", Toast.LENGTH_SHORT).show()
                    val intent = Intent(this@ShoeDetailsActivity, ShoppingCartActivity::class.java)
                    startActivity(intent)
                } else {
                    Toast.makeText(this@ShoeDetailsActivity, "Failed to add to cart.", Toast.LENGTH_SHORT).show()
                }
            }


            override fun onFailure(call: Call<Void>, t: Throwable) {
                Toast.makeText(this@ShoeDetailsActivity, "Error: ${t.message}", Toast.LENGTH_SHORT).show()
            }
        })
    }
}