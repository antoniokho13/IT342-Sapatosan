package com.frontend_mobile.models

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.frontend_mobile.databinding.ItemCartBinding
import com.frontend_mobile.models.CartItem
import com.bumptech.glide.Glide

class CartItemAdapter(private val cartItems: List<CartItem>) :
    RecyclerView.Adapter<CartItemAdapter.CartViewHolder>() {

    inner class CartViewHolder(val binding: ItemCartBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): CartViewHolder {
        val binding = ItemCartBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return CartViewHolder(binding)
    }

    override fun onBindViewHolder(holder: CartViewHolder, position: Int) {
        val cartItem = cartItems[position]

        holder.binding.apply {
            shoeName.text = cartItem.shoe.name
            shoePrice.text = "₱${cartItem.shoe.price}"
            selectedSize.text = "Size: ${cartItem.selectedSize}"
            selectedQuantity.text = "Qty: ${cartItem.selectedQuantity}"

            Glide.with(shoeImage.context)
                .load(cartItem.shoe.imageUrl)
                .into(shoeImage)
        }
    }

    override fun getItemCount(): Int = cartItems.size
}
