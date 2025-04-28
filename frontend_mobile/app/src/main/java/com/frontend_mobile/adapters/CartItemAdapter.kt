package com.frontend_mobile.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.frontend_mobile.R
import com.frontend_mobile.models.CartItem

class CartItemAdapter(
    private val cartItems: MutableList<CartItem>,
    private val onItemChanged: (() -> Unit)? = null
) : RecyclerView.Adapter<CartItemAdapter.CartViewHolder>() {

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
        holder.shoeName.text = item.name
        holder.shoeSize.text = "Size: US ${item.selectedSize}"
        holder.shoeQuantity.text = item.selectedQuantity.toString()
        holder.shoePrice.text = "₱${item.price * item.selectedQuantity}"

        Glide.with(holder.shoeImage.context)
            .load(item.imageUrl)
            .into(holder.shoeImage)

        holder.btnIncrease.setOnClickListener {
            item.selectedQuantity += 1
            notifyItemChanged(position)
            onItemChanged?.invoke()
        }
        holder.btnDecrease.setOnClickListener {
            if (item.selectedQuantity > 1) {
                item.selectedQuantity -= 1
                notifyItemChanged(position)
                onItemChanged?.invoke()
            } else {
                cartItems.removeAt(position)
                notifyItemRemoved(position)
                notifyItemRangeChanged(position, cartItems.size)
                onItemChanged?.invoke()
            }
        }
    }


    override fun getItemCount(): Int = cartItems.size

    fun updateCartItems(newItems: List<CartItem>) {
        cartItems.clear()
        cartItems.addAll(newItems)
        notifyDataSetChanged()
        onItemChanged?.invoke()
    }

    fun clearCart() {
        cartItems.clear()
        notifyDataSetChanged()
        onItemChanged?.invoke()
    }
}