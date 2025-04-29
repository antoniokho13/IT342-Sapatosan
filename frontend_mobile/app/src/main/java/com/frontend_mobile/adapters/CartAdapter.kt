package com.frontend_mobile.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.frontend_mobile.R
import com.frontend_mobile.models.ProductDTO
import com.frontend_mobile.models.ProductEntity

class CartAdapter(
    private val products: MutableList<ProductEntity>,
    private val onCartUpdated: () -> Unit,
    onQuantityChange: () -> Unit
) : RecyclerView.Adapter<CartAdapter.CartViewHolder>() {

    inner class CartViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val productName: TextView = itemView.findViewById(R.id.shoeName)
        val productQuantity: TextView = itemView.findViewById(R.id.selectedQuantity)
        val productPrice: TextView = itemView.findViewById(R.id.shoePrice)
        val productImage: ImageView = itemView.findViewById(R.id.shoeImage)
        val btnIncrease: Button = itemView.findViewById(R.id.btnIncrease)
        val btnDecrease: Button = itemView.findViewById(R.id.btnDecrease)
        val shoeSize: TextView = itemView.findViewById(R.id.shoeSize)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): CartViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_cart, parent, false)
        return CartViewHolder(view)
    }

    override fun onBindViewHolder(holder: CartViewHolder, position: Int) {
        val product = products[position]
        holder.productName.text = product.name
        holder.productQuantity.text = product.quantity.toString()
        holder.productPrice.text = "₱${product.price * product.quantity}"

        // Add size if available
        product.size?.let { size ->
            holder.shoeSize.text = "Size: $size"
            holder.shoeSize.visibility = View.VISIBLE
        } ?: run {
            holder.shoeSize.visibility = View.GONE
        }

        // Load image using Glide
        Glide.with(holder.productImage.context)
            .load(product.imageUrl)
            .into(holder.productImage)

        holder.btnIncrease.setOnClickListener {
            if (product.quantity < product.stock) {
                product.quantity += 1
                notifyItemChanged(position)
                onCartUpdated()
            } else {
                Toast.makeText(holder.itemView.context, "Stock limit reached", Toast.LENGTH_SHORT).show()
            }
        }

        holder.btnDecrease.setOnClickListener {
            if (product.quantity > 1) {
                product.quantity -= 1
                notifyItemChanged(position)
                onCartUpdated()
            } else {
                products.removeAt(position)
                notifyItemRemoved(position)
                notifyItemRangeChanged(position, products.size)
                onCartUpdated()
            }
        }
    }

    override fun getItemCount(): Int = products.size


    fun clearCart() {
        products.clear()
        notifyDataSetChanged()
        onCartUpdated()
    }

    fun getTotalPrice(): Double {
        return products.sumOf { it.price * it.quantity }
    }
}
