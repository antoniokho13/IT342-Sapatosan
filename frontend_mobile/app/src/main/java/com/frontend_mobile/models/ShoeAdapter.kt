package com.frontend_mobile.models

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.frontend_mobile.models.ShoeItem
import com.frontend_mobile.databinding.ItemShoeBinding

class ShoeAdapter(private val items: MutableList<ShoeItem>) :
    RecyclerView.Adapter<ShoeAdapter.ShoeViewHolder>() {

    inner class ShoeViewHolder(val binding: ItemShoeBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ShoeViewHolder {
        val binding = ItemShoeBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return ShoeViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ShoeViewHolder, position: Int) {
        val item = items[position]
        holder.binding.shoeName.text = item.name
        holder.binding.shoePrice.text = item.price
        holder.binding.shoeImage.setImageResource(item.imageResId)
    }

    override fun getItemCount() = items.size

    fun updateList(newItems: List<ShoeItem>) {
        items.clear()
        items.addAll(newItems)
        notifyDataSetChanged()
    }
}