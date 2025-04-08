package com.frontend_mobile

import android.os.Bundle
import android.view.Gravity
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.GravityCompat
import androidx.drawerlayout.widget.DrawerLayout
import androidx.recyclerview.widget.GridLayoutManager
import com.frontend_mobile.databinding.ActivityHomeBinding

class HomeActivity : AppCompatActivity() {

    private lateinit var binding: ActivityHomeBinding
    private lateinit var shoeAdapter: ShoeAdapter
    private lateinit var drawerLayout: DrawerLayout

    private val shoeList = listOf(
        ShoeItem("OBERON", "₱1,923.00", R.drawable.nike_invincible_3_men_road, "BASKETBALL"),
        ShoeItem("MUFER", "₱2,293.00", R.drawable.nike_invincible_3_men_road, "RUNNING"),
        ShoeItem("OBERON", "₱1,923.00", R.drawable.nike_invincible_3_men_road, "CASUAL"),
        ShoeItem("MUFER", "₱2,293.00", R.drawable.nike_invincible_3_men_road, "RUNNING"),
        ShoeItem("MUFER", "₱2,293.00", R.drawable.nike_invincible_3_men_road, "RUNNING"),
        ShoeItem("MUFER", "₱2,293.00", R.drawable.nike_invincible_3_men_road, "RUNNING"),
        ShoeItem("MUFER", "₱2,293.00", R.drawable.nike_invincible_3_men_road, "RUNNING"),
        ShoeItem("MUFER", "₱2,293.00", R.drawable.nike_invincible_3_men_road, "RUNNING"),
        ShoeItem("MUFER", "₱2,293.00", R.drawable.nike_invincible_3_men_road, "RUNNING"),
        ShoeItem("MUFER", "₱2,293.00", R.drawable.nike_invincible_3_men_road, "RUNNING")
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityHomeBinding.inflate(layoutInflater)
        setContentView(binding.root)

        drawerLayout = binding.drawerLayout // <-- ID must match your XML root DrawerLayout

        setupRecyclerView()
        setupNavigation()
        updateCategory("ALL")

        binding.icMenu.setOnClickListener {
            if (drawerLayout.isDrawerOpen(GravityCompat.START)) {
                drawerLayout.closeDrawer(Gravity.LEFT)
            } else {
                drawerLayout.openDrawer(GravityCompat.END)
            }
        }
    }

    override fun onBackPressed() {
        if (drawerLayout.isDrawerOpen(GravityCompat.START)) {
            drawerLayout.closeDrawer(GravityCompat.END)
        } else {
            super.onBackPressed()
        }
    }

    private fun setupRecyclerView() {
        shoeAdapter = ShoeAdapter(mutableListOf())
        binding.recyclerViewShoes.layoutManager = GridLayoutManager(this, 2)
        binding.recyclerViewShoes.adapter = shoeAdapter
    }

    private fun setupNavigation() {
        binding.logoImage.setOnClickListener { updateCategory("ALL") }
        binding.btnBasketball.setOnClickListener { updateCategory("BASKETBALL") }
        binding.btnCasual.setOnClickListener { updateCategory("CASUAL") }
        binding.btnRunning.setOnClickListener { updateCategory("RUNNING") }
    }

    private fun updateCategory(category: String) {
        binding.btnBasketball.setTextColor(getColor(R.color.black))
        binding.btnCasual.setTextColor(getColor(R.color.black))
        binding.btnRunning.setTextColor(getColor(R.color.black))

        when (category) {
            "BASKETBALL" -> binding.btnBasketball.setTextColor(getColor(R.color.selected))
            "CASUAL" -> binding.btnCasual.setTextColor(getColor(R.color.selected))
            "RUNNING" -> binding.btnRunning.setTextColor(getColor(R.color.selected))
        }

        val filteredShoes = if (category == "ALL") shoeList else shoeList.filter { it.category == category }
        shoeAdapter.updateList(filteredShoes)

        Toast.makeText(this, "Selected category: $category", Toast.LENGTH_SHORT).show()
    }
}
