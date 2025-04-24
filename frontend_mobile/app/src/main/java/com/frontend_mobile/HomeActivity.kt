package com.frontend_mobile

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.GravityCompat
import androidx.drawerlayout.widget.DrawerLayout
import androidx.recyclerview.widget.GridLayoutManager
import com.frontend_mobile.api.RetrofitClient
import com.frontend_mobile.databinding.ActivityHomeBinding
import com.frontend_mobile.models.ShoeAdapter
import com.frontend_mobile.models.ShoeItem
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class HomeActivity : AppCompatActivity() {

    private lateinit var binding: ActivityHomeBinding
    private lateinit var shoeAdapter: ShoeAdapter
    private lateinit var drawerLayout: DrawerLayout
    private var allShoes: List<ShoeItem> = emptyList()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityHomeBinding.inflate(layoutInflater)
        setContentView(binding.root)

        drawerLayout = binding.drawerLayout

        setupRecyclerView()
        setupNavigation()
        fetchShoes()

        binding.icMenu.setOnClickListener {
            if (drawerLayout.isDrawerOpen(GravityCompat.END)) {
                drawerLayout.closeDrawer(GravityCompat.END)
            } else {
                drawerLayout.openDrawer(GravityCompat.END)
            }
        }
    }

    private fun setupRecyclerView() {
        shoeAdapter = ShoeAdapter(mutableListOf()) { shoe ->
            val intent = Intent(this, ShoeDetailsActivity::class.java)
            intent.putParcelableArrayListExtra("allShoes", ArrayList(allShoes)) // Pass allShoes
            intent.putExtra("selectedShoe", shoe) // Pass the selected shoe
            startActivity(intent)
        }
        binding.recyclerViewShoes.layoutManager = GridLayoutManager(this, 2)
        binding.recyclerViewShoes.adapter = shoeAdapter
    }

    private fun setupNavigation() {
        binding.logoImage.setOnClickListener { updateCategory("ALL") }
        binding.btnBasketball.setOnClickListener { updateCategory("BASKETBALL") }
        binding.btnCasual.setOnClickListener { updateCategory("CASUAL") }
        binding.btnRunning.setOnClickListener { updateCategory("RUNNING") }
    }

    private fun fetchShoes() {
        RetrofitClient.instance.getProducts().enqueue(object : Callback<List<ShoeItem>> {
            override fun onResponse(call: Call<List<ShoeItem>>, response: Response<List<ShoeItem>>) {
                if (response.isSuccessful) {
                    allShoes = response.body() ?: emptyList()
                    updateCategory("ALL")
                } else {
                    Toast.makeText(this@HomeActivity, "Failed to fetch shoes: ${response.message()}", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<List<ShoeItem>>, t: Throwable) {
                Toast.makeText(this@HomeActivity, "Error: ${t.message}", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun updateCategory(category: String) {
        // Reset all button colors to default
        binding.btnBasketball.setTextColor(getColor(R.color.black))
        binding.btnCasual.setTextColor(getColor(R.color.black))
        binding.btnRunning.setTextColor(getColor(R.color.black))

        // Highlight the selected category button
        when (category) {
            "BASKETBALL" -> binding.btnBasketball.setTextColor(getColor(R.color.selected))
            "CASUAL" -> binding.btnCasual.setTextColor(getColor(R.color.selected))
            "RUNNING" -> binding.btnRunning.setTextColor(getColor(R.color.selected))
        }

        // Filter shoes based on the selected category
        val filteredShoes = if (category == "ALL") {
            allShoes
        } else {
            allShoes.filter { it.categoryId.equals(category, ignoreCase = true) }
        }

        // Update the RecyclerView with the filtered list
        shoeAdapter.updateList(filteredShoes)

        // Show a toast message for the selected category
        Toast.makeText(this, "Selected category: $category", Toast.LENGTH_SHORT).show()
    }
}