package com.frontend_mobile.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.frontend_mobile.R
import com.frontend_mobile.models.CartItem

class CartAdapter(
    private val cartItems: MutableList<CartItem>,
    private val onCartUpdated: () -> Unit
) : RecyclerView.Adapter<CartAdapter.CartViewHolder>() {

    inner class CartViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val shoeName: TextView = itemView.findViewById(R.id.shoeName)
        val shoeSize: TextView = itemView.findViewById(R.id.selectedSize)
        val shoeQuantity: TextView = itemView.findViewById(R.id.selectedQuantity)
        val shoePrice: TextView = itemView.findViewById(R.id.shoePrice)
        val shoeImage: ImageView = itemView.findViewById(R.id.shoeImage)
        val btnIncrease: Button = itemView.findViewById(R.id.btnIncrease)
        val btnDecrease: Button = itemView.findViewById(R.id.btnDecrease)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): CartViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_cart, parent, false)
        return CartViewHolder(view)
    }

    override fun onBindViewHolder(holder: CartViewHolder, position: Int) {
        val item = cartItems[position]
        holder.shoeName.text = item.product
        holder.shoeSize.text = "Size: US ${item.selectedSize}"
        holder.shoeQuantity.text = item.selectedQuantity.toString()
        holder.shoePrice.text = "₱${item.price * item.selectedQuantity}"

        Glide.with(holder.shoeImage.context)
            .load(item.imageUrl)
            .into(holder.shoeImage)

        holder.btnIncrease.setOnClickListener {
            item.selectedQuantity++
            notifyItemChanged(position)
            onCartUpdated()
        }
        holder.btnDecrease.setOnClickListener {
            if (item.selectedQuantity > 1) {
                item.selectedQuantity--
                notifyItemChanged(position)
                onCartUpdated()
            } else {
                cartItems.removeAt(position)
                notifyItemRemoved(position)
                notifyItemRangeChanged(position, cartItems.size)
                onCartUpdated()
            }
        }
    }

    override fun getItemCount(): Int = cartItems.size

    fun getCartItems(): List<CartItem> {
        return cartItems
    }

    fun getTotalPrice(): Double {
        return cartItems.sumOf { it.price * it.selectedQuantity }
    }

    fun updateItems(newItems: List<CartItem>) {
        cartItems.clear()
        cartItems.addAll(newItems)
        notifyDataSetChanged()
    }

    fun clearCart() {
        cartItems.clear()
        notifyDataSetChanged()
        onCartUpdated()
    }
}
