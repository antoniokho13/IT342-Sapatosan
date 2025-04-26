package com.frontend_mobile.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.appcompat.app.AlertDialog
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.frontend_mobile.R
import com.frontend_mobile.models.CartItem
import com.frontend_mobile.models.CartManager

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
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): CartViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_cart, parent, false)
        return CartViewHolder(view)
    }

    override fun onBindViewHolder(holder: CartViewHolder, position: Int) {
        val item = cartItems[position]
        holder.shoeName.text = item.shoe.name
        holder.shoeSize.text = "Size: US ${item.selectedSize}"
        holder.shoeQuantity.text = "Qty: ${item.selectedQuantity}"
        holder.shoePrice.text = "₱${item.shoe.price * item.selectedQuantity}"

        Glide.with(holder.shoeImage.context)
            .load(item.shoe.imageUrl)
            .into(holder.shoeImage)

        holder.itemView.setOnLongClickListener {
            AlertDialog.Builder(holder.itemView.context)
                .setTitle("Remove Item")
                .setMessage("Are you sure you want to remove ${item.shoe.name} (Size ${item.selectedSize})?")
                .setPositiveButton("Yes") { _, _ ->
                    CartManager.removeItem(item)
                    cartItems.removeAt(position)
                    notifyItemRemoved(position)
                    notifyItemRangeChanged(position, cartItems.size)
                    onCartUpdated()
                }
                .setNegativeButton("No", null)
                .show()
            true
        }
    }

    override fun getItemCount(): Int = cartItems.size
}