package com.frontend_mobile.adapters

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.frontend_mobile.databinding.ItemShoeBinding
import com.frontend_mobile.models.ShoeItem

class ShoeAdapter(
    private val items: MutableList<ShoeItem>,
    private val onItemClick: (ShoeItem) -> Unit
) : RecyclerView.Adapter<ShoeAdapter.ShoeViewHolder>() {

    inner class ShoeViewHolder(val binding: ItemShoeBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ShoeViewHolder {
        val binding = ItemShoeBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return ShoeViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ShoeViewHolder, position: Int) {
        val item = items[position]
        holder.binding.shoeName.text = item.name
        holder.binding.shoePrice.text = "₱${item.price}"
        Glide.with(holder.itemView.context)
            .load(item.imageUrl)
            .into(holder.binding.shoeImage)

        holder.itemView.setOnClickListener {
            onItemClick(item)
        }
    }

    override fun getItemCount() = items.size

    fun updateList(newItems: List<ShoeItem>) {
        items.clear()
        items.addAll(newItems)
        notifyDataSetChanged()
    }
}