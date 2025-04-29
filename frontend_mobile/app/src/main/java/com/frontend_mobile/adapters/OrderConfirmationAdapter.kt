package com.frontend_mobile.adapters

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.frontend_mobile.databinding.ItemOrderConfirmationBinding
import com.frontend_mobile.models.ProductEntity

class OrderConfirmationAdapter(private val items: List<ProductEntity>) :
    RecyclerView.Adapter<OrderConfirmationAdapter.ViewHolder>() {

    class ViewHolder(val binding: ItemOrderConfirmationBinding) :
        RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemOrderConfirmationBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return ViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val item = items[position]
        holder.binding.apply {
            productName.text = item.name
            quantity.text = "Quantity: ${item.quantity}" // Corrected line
            price.text = "₱${"%.2f".format(item.price)}"
        }
    }

    override fun getItemCount() = items.size
}
