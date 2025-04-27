package com.frontend_mobile

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.AdapterView
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
import android.widget.ArrayAdapter
import androidx.appcompat.widget.SearchView
import android.content.Context


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
        setupDrawerNavigation()
        setupTopNavigation()
        setupSearchAndFilter()
        fetchShoes()

        binding.icMenu.setOnClickListener {
            if (drawerLayout.isDrawerOpen(GravityCompat.END)) {
                drawerLayout.closeDrawer(GravityCompat.END)
            } else {
                drawerLayout.openDrawer(GravityCompat.END)
            }
        }
    }

    private fun setupDrawerNavigation() {
        // Drawer navigation setup
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

            // Finish current activity
            finish()
        }
    }

    private fun setupTopNavigation() {
        // Navigate to ProfileActivity
        binding.drawerProfile.setOnClickListener {
            startActivity(Intent(this, ProfileActivity::class.java))
        }
        // Navigate to SettingsActivity
        binding.tvSettings.setOnClickListener {
            startActivity(Intent(this, SettingsActivity::class.java))
        }
    }


    private fun setupSearchAndFilter() {
        // Populate filter options
        val filterOptions = listOf("All", "Basketball", "Casual", "Running")
        val adapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, filterOptions)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        binding.filterSpinner.adapter = adapter

        // Set up filter spinner listener
        binding.filterSpinner.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                // Handle filter selection
            }

            override fun onNothingSelected(parent: AdapterView<*>?) {
                // Handle no selection
            }
        }

        // Set up search view listener
        binding.searchView.setOnQueryTextListener(object : SearchView.OnQueryTextListener {
            override fun onQueryTextSubmit(query: String?): Boolean {
                // Handle search submission
                return true
            }

            override fun onQueryTextChange(newText: String?): Boolean {
                // Handle text change
                return true
            }
        })
    }

    private fun searchShoes(query: String) {
        val filteredShoes = allShoes.filter { it.name.contains(query, ignoreCase = true) }
        shoeAdapter.updateList(filteredShoes)
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

        binding.tvSettings.setOnClickListener {
            startActivity(Intent(this, SettingsActivity::class.java))
        }

        binding.drawerProfile.setOnClickListener {
            startActivity(Intent(this, ProfileActivity::class.java))
        }

        binding.drawerShoppingCart.setOnClickListener {
            startActivity(Intent(this, ShoppingCartActivity::class.java))
        }
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