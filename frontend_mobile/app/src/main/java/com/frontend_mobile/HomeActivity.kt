package com.frontend_mobile

import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.GridLayoutManager
import com.frontend_mobile.databinding.ActivityHomeBinding

class HomeActivity : AppCompatActivity() {

    private lateinit var binding: ActivityHomeBinding
    private lateinit var shoeAdapter: ShoeAdapter

    private val shoeList = listOf(
        ShoeItem("OBERON", "₱1,923.00", R.drawable.ic_menu, "BASKETBALL"),
        ShoeItem("MUFER", "₱2,293.00", R.drawable.ic_menu, "RUNNING"),
        ShoeItem("OBERON", "₱1,923.00", R.drawable.ic_menu, "CASUAL")
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityHomeBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupRecyclerView()
        setupNavigation()
        updateCategory("ALL")
    }

    private fun setupRecyclerView() {
        shoeAdapter = ShoeAdapter(mutableListOf())
        binding.recyclerViewShoes.layoutManager = GridLayoutManager(this, 2)
        binding.recyclerViewShoes.adapter = shoeAdapter
    }

    private fun setupNavigation() {
        binding.btnAll.setOnClickListener { updateCategory("ALL") }
        binding.btnBasketball.setOnClickListener { updateCategory("BASKETBALL") }
        binding.btnCasual.setOnClickListener { updateCategory("CASUAL") }
        binding.btnRunning.setOnClickListener { updateCategory("RUNNING") }
    }

    private fun updateCategory(category: String) {
        binding.btnAll.setTextColor(getColor(R.color.black))
        binding.btnBasketball.setTextColor(getColor(R.color.black))
        binding.btnCasual.setTextColor(getColor(R.color.black))
        binding.btnRunning.setTextColor(getColor(R.color.black))

        when (category) {
            "ALL" -> binding.btnAll.setTextColor(getColor(R.color.selected))
            "BASKETBALL" -> binding.btnBasketball.setTextColor(getColor(R.color.selected))
            "CASUAL" -> binding.btnCasual.setTextColor(getColor(R.color.selected))
            "RUNNING" -> binding.btnRunning.setTextColor(getColor(R.color.selected))
        }

        val filteredShoes = if (category == "ALL") shoeList else shoeList.filter { it.category == category }
        shoeAdapter.updateList(filteredShoes)

        Toast.makeText(this, "Selected category: $category", Toast.LENGTH_SHORT).show()
    }
}