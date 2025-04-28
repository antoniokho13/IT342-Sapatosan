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
import com.frontend_mobile.models.ProductEntity

class CartItemAdapter(
    private val products: MutableList<ProductEntity>,
    private val onItemChanged: (() -> Unit)? = null
) : RecyclerView.Adapter<CartItemAdapter.CartViewHolder>() {

    inner class CartViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val productName: TextView = itemView.findViewById(R.id.shoeName)
        val productQuantity: TextView = itemView.findViewById(R.id.selectedQuantity)
        val productPrice: TextView = itemView.findViewById(R.id.shoePrice)
        val productImage: ImageView = itemView.findViewById(R.id.shoeImage)
        val btnIncrease: Button = itemView.findViewById(R.id.btnIncrease)
        val btnDecrease: Button = itemView.findViewById(R.id.btnDecrease)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): CartViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_cart, parent, false)
        return CartViewHolder(view)
    }

    override fun onBindViewHolder(holder: CartViewHolder, position: Int) {
        val product = products[position]
        holder.productName.text = product.name
        holder.productQuantity.text = product.stock.toString()
        holder.productPrice.text = "₱${product.price * product.stock}"

        Glide.with(holder.productImage.context)
            .load(product.imageUrl)
            .into(holder.productImage)

        holder.btnIncrease.setOnClickListener {
            if (product.stock < 10) { // Assuming 10 is the max stock for simplicity
                product.stock += 1
                notifyItemChanged(position)
                onItemChanged?.invoke()
            } else {
                Toast.makeText(holder.itemView.context, "Stock limit reached", Toast.LENGTH_SHORT).show()
            }
        }

        holder.btnDecrease.setOnClickListener {
            if (product.stock > 1) {
                product.stock -= 1
                notifyItemChanged(position)
                onItemChanged?.invoke()
            } else {
                products.removeAt(position)
                notifyItemRemoved(position)
                notifyItemRangeChanged(position, products.size)
                onItemChanged?.invoke()
            }
        }
    }

    override fun getItemCount(): Int = products.size

    fun updateProducts(newProducts: List<ProductEntity>) {
        products.clear()
        products.addAll(newProducts)
        notifyDataSetChanged()
        onItemChanged?.invoke()
    }

    fun clearCart() {
        products.clear()
        notifyDataSetChanged()
        onItemChanged?.invoke()
    }
}